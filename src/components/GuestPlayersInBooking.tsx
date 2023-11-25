import { type User, type Booking, type Guest } from "@prisma/client";
import { Player } from "./Player";

export type Props = {
  guests?: Guest[];
  booking: Booking;
};

const GuestPlayersInBooking = ({ guests, booking }: Props) => {
  const mappedGuests = guests?.map((guest) => {
    return {
      id: guest.id,
      name: guest.name,
    } as User;
  });

  return (
    <ul>
      {mappedGuests?.map((guest) => (
        <li key={guest.id}>
          <Player isGuest user={guest} booking={booking} />
        </li>
      ))}
    </ul>
  );
};

export default GuestPlayersInBooking;
