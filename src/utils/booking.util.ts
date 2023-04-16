import type Booking from "~/pages/booking";
import { today } from "./time.util";
import { getBookingCreatedEmail } from '~/email/bookingUpdated';

type BookingsByDateProps = {
    bookings?: Booking[];
    path: string;
    sessionUserId?: string
}

type EmailDispatchProps = {
  bookerName?: string;
  playerName?: string
  bookings?: Booking[];
  booking: Booking
  eventType: EventType;
  mutation: {
    mutate: ({ }: any, {}: any) => void;
  };
}
export type EventType = "ADD" | "MODIFY" | "DELETE" | "JOIN" | "LEAVE" | "CANCELED";

function padZero(value: number) {
  return (value < 10) ? `0${value}` : value;
}

export const getTimeWithZeroPadding = (hours: number, minutes: number)  => {
  const hoursPadded = padZero(hours);
  const minutesPadded = padZero(minutes);
  return `${hoursPadded}:${minutesPadded}`;
}

export const emailDispatcher = ({ bookerName, playerName, bookings, booking, mutation, eventType }: EmailDispatchProps) => {
  if (!bookings?.[0]) {
    return null;
  }

  const htmlString = getBookingCreatedEmail({
    bookerName,
    playerName,
    eventType,
    booking,
    bookings
  }
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  mutation.mutate(
    {
      eventType,
      htmlString,
    },
    {
      onSuccess: () => {
        console.log("MUTATION DONE EMAIL");
      },
    }
  );
};

export const bookingsByDate = ({ bookings, path, sessionUserId }: BookingsByDateProps): Booking[] | undefined => {
    const history = path === "/history";
    const joined = path === "/joined";
    const created = path === "/created";    

    return bookings
    ?.sort((a: Booking, b: Booking) => a.date.getTime() - b.date.getTime())
    .filter((booking) =>
    history
        ? booking.date.getTime() < today
        : booking.date.getTime() >= today
    )
    .filter((booking) => {
    if (!sessionUserId) {
        return booking.date.getTime() >= today;
    }
    if (joined) {
        return booking.players.includes(sessionUserId);
    } else if (created) {
        return booking.userId === sessionUserId;
    } else if (history) {
        return booking.date.getTime() < today;
    } else {
        return booking.date.getTime() >= today;
    }
    })
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