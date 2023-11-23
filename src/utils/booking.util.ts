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
  sendEmail: any;
};

type EmailInviteDispatchProps = {
  email: string;
  association: Association;
  inviterName: string;
  recipients?: string[];
  sendEmail: any;
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

export const maxPlayersToShow = [4, 6, 8, 10, 12].map((item) => ({
  id: String(item),
  name: String(item),
}));

export const emailInviteDispatcher = ({
  email,
  inviterName,
  sendEmail,
  association,
}: EmailInviteDispatchProps) => {
  const htmlString = buildHtmlInvitationTemplate({
    inviterName,
    emailInvited: email,
    association,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  sendEmail(
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
  sendEmail,
  eventType,
}: EmailDispatchProps) => {
  console.log("sendEmail", sendEmail);

  const htmlString = buildHtmlTemplate({
    bookerName,
    playerName,
    eventType,
    mutatedBooking,
    originalBooking,
    bookings,
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  sendEmail(
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
  user,
  bookings,
  path,
  sessionUserId,
}: BookingsByDateProps): Booking[] | undefined => {
  const history = path === "/history";
  const joined = path === "/joined";
  const created = path === "/created";

  if (!sessionUserId) {
    return bookings?.filter((booking) =>
      !booking.associationId ? getBookingEndDate(booking) >= today : false
    );
  }

  return bookings
    ?.sort((a: Booking, b: Booking) =>
      history
        ? b.date.getTime() - a.date.getTime()
        : a.date.getTime() - b.date.getTime()
    )
    .filter((booking) => {
      return booking.associationId
        ? user?.associations.includes(booking.associationId) ||
            booking.players.includes(sessionUserId)
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

export const getProgressAccent = (booking: Booking, guestPlayers: number) => {
  const percentFilled = Math.floor(
    ((booking.players.length + guestPlayers) / (booking.maxPlayers || 4)) * 100
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
