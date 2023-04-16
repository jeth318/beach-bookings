import { NextAuth } from 'next-auth';
import type Booking from "~/pages/booking";
import { today } from "./time.util";
import { type Booking, Session, User, type Booking } from '@prisma/client';
import { getBookingCreatedEmail } from '~/email/bookingUpdated';
import { UseTRPCMutationResult } from '@trpc/react-query/shared';

type BookingsByDateProps = {
    bookings?: Booking[];
    path: string;
    sessionUserId?: string
}

type EmailDispatchProps = {
  bookerName?: string;
  playerName?: string
  bookings: Booking[]; 
  eventType: EventType;
  mutation: any;
}
export type EventType = "ADD" | "MODIFY" | "DELETE" | "JOIN" | "LEAVE" | "CANCELED";

function padZero(value: number) {
  return (value < 10) ? `0${value}` : value;
}

export const getTimeWithZeroPadding = (hours: number | string, minutes: number | string)  => {
  hours = padZero(hours);
  minutes = padZero(minutes);
  return `${hours}:${minutes}`;
}

export const emailDispatcher = ({ bookerName, playerName, bookings, mutation, eventType }: EmailDispatchProps) => {
  if (!bookings?.[0]) {
    return null;
  }

  const htmlString = getBookingCreatedEmail({
    bookerName,
    playerName,
    eventType,
    booking: bookings[0]
  }
  );

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