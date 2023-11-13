import { type User, type Association, type Booking } from "@prisma/client";
import { today } from "./time.util";
import { buildHtmlInvitationTemplate } from "~/email/invitaion-template";
import { buildHtmlTemplate } from "~/email/template";

type BookingsByDateProps = {
  associations: Association[];
  user?: User | null | undefined;
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

type EmailInviteDispatchProps = {
  email: string;
  association: Association;
  inviterName: string;
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

export const maxPlayersToShow = [4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => ({
  id: String(item),
  name: String(item),
}));

export const emailInviteDispatcher = ({
  email,
  inviterName,
  mutation,
  association,
}: EmailInviteDispatchProps) => {
  const htmlString = buildHtmlInvitationTemplate({
    inviterName,
    emailInvited: email,
    association,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  mutation.mutate(
    {
      emailAddresses: [email],
      htmlString,
    },
    {
      onSuccess: () => null,
    }
  );
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
      onSuccess: () => null,
    }
  );
};

export const bookingsByDate = ({
  associations,
  user,
  bookings,
  path,
  sessionUserId,
}: BookingsByDateProps): Booking[] | undefined => {
  const history = path === "/history";
  const joined = path === "/joined";
  const created = path === "/created";

  if (!sessionUserId) {
    return bookings?.filter((booking) => {
      if (!booking.associationId) {
        return getBookingEndDate(booking) >= today;
      }

      if (!!booking.associationId) {
        const association = associations.find(
          ({ id }) => id === booking.associationId
        );
        return !association?.private;
      }
    });
  }

  return bookings
    ?.sort((a: Booking, b: Booking) =>
      history
        ? b.date.getTime() - a.date.getTime()
        : a.date.getTime() - b.date.getTime()
    )
    .filter((booking) => {
      console.log("booking?.associationId", booking?.associationId);
      console.log("user?.associations", user?.associations);
      return booking.associationId ? user?.associations.includes(booking.associationId) : true;
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
  const percentFilled = Math.floor(
    (booking.players.length / (booking.maxPlayers || 4)) * 100
  );

  if (percentFilled <= 25) {
    return "text-error";
  }

  if (percentFilled > 25 && percentFilled <= 75) {
    return "text-warning";
  }

  if (percentFilled >= 100) {
    return "text-success";
  }

  return "text-error";
};
