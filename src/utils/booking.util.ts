import { type Association, type Booking } from "@prisma/client";
import { today } from "./time.util";
import { buildHtmlTemplate } from "~/email/template";

type BookingsByDateProps = {
  associations: Association[];
  bookings?: Booking[];
  path: string;
  sessionUserId?: string;
};

type EmailDispatchProps = {
  bookerName?: string;
  playerName?: string;
  bookings?: Booking[];
  originalBooking: Booking;
  mutatedBooking?: Booking;
  eventType: EventType;
  recipients?: string[];
  mutation: {
    mutate: ({}: any, {}: any) => void;
  };
};

export const isOngoingGame = (booking: Booking) => {
  const start = booking.date.getTime();
  const end = getBookingEndDate(booking);
  return today > start && today < end;
};

export type EventType =
  | "ADD"
  | "MODIFY"
  | "DELETE"
  | "JOIN"
  | "LEAVE"
  | "KICK"
  | "CANCELED";

function padZero(value: number) {
  return value < 10 ? `0${value}` : value;
}

export const getBookingEndDate = (booking: Booking) =>
  new Date(booking.date.getTime() + booking.duration * 60 * 1000).getTime();

export const getTimeWithZeroPadding = (hours: number, minutes: number) => {
  const hoursPadded = padZero(hours);
  const minutesPadded = padZero(minutes);
  return `${hoursPadded}:${minutesPadded}`;
};

export const emailDispatcher = ({
  bookerName,
  recipients,
  playerName,
  bookings,
  originalBooking,
  mutatedBooking,
  mutation,
  eventType,
}: EmailDispatchProps) => {
  if (!bookings?.[0]) {
    return null;
  }

  const htmlString = buildHtmlTemplate({
    bookerName,
    playerName,
    eventType,
    mutatedBooking,
    originalBooking,
    bookings,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  mutation.mutate(
    {
      recipients,
      eventType,
      htmlString,
    },
    {
      onSuccess: () => {
        console.log(`Email sent to ${recipients?.toString() || ""}`);
      },
    }
  );
};

export const bookingsByDate = ({
  associations,
  bookings,
  path,
  sessionUserId,
}: BookingsByDateProps): Booking[] | undefined => {
  const history = path === "/history";
  const joined = path === "/joined";
  const created = path === "/created";

  if (!sessionUserId) {
    return [];
  }

  return bookings
    ?.sort((a: Booking, b: Booking) =>
      history
        ? b.date.getTime() - a.date.getTime()
        : a.date.getTime() - b.date.getTime()
    )
    .filter((booking) => {
      const association = associations.find(
        (item) => item.id === booking.associationId
      );

      return association?.private
        ? !!association.members.includes(sessionUserId)
        : true;
    })
    .filter((booking) => {
      const bookingEnd = getBookingEndDate(booking);
      return history ? bookingEnd < today : bookingEnd >= today;
    })
    .filter((booking) => {
      const bookingEnd = getBookingEndDate(booking);
      if (!sessionUserId) {
        return bookingEnd >= today;
      }
      if (joined) {
        return booking.players.includes(sessionUserId);
      } else if (created) {
        return booking.userId === sessionUserId;
      } else if (history) {
        return bookingEnd < today;
      } else {
        return bookingEnd >= today;
      }
    });
};

export const getProgressAccent = (booking: Booking) => {
  switch (booking?.players?.length) {
    case 1:
      return "text-error";
    case 2:
      return "text-warning";
    case 3:
      return "text-warning";
    case 4:
      return "text-success";
    default:
      return "text-error";
  }
};
