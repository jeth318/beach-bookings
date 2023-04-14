import type Booking from "~/pages/booking";
import { today } from "./time.util";

type BookingsByDateProps = {
    bookings?: Booking[];
    path: string;
    sessionUserId?: string
}

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