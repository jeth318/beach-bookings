import { type User, type Booking } from "@prisma/client";
import { Player } from "./Player";
import { getUsersByBooking } from "~/utils/general.util";

export type Props = {
  users: User[];
  booking: Booking;
};

export const PartyLeader = ({ users, booking }: Props) => {
  const booker = getUsersByBooking(users, booking).find(
    (user) => user.id === booking.userId
  );

  return booker ? <Player user={booker} booking={booking} /> : null;
};
