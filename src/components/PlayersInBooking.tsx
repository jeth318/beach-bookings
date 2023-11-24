import { type User, type Booking } from "@prisma/client";
import { getUsersByBooking } from "~/utils/general.util";
import { Player } from "./Player";

export type Props = {
  users: User[];
  booking: Booking;
};

const PlayersInBooking = ({ users, booking }: Props) => {
  const players = getUsersByBooking(users, booking).filter(
    (player) => player.id !== booking.userId
  );

  return (
    <ul>
      {players.map((player) => (
        <li key={player.id}>
          <Player user={player} booking={booking} />
        </li>
      ))}
    </ul>
  );
};

export default PlayersInBooking;
