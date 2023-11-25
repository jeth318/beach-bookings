import { type User, type Booking } from "@prisma/client";
import { BeatLoader } from "react-spinners";
import PlayersInBooking from "./PlayersInBooking";
import { PartyLeader } from "./PartyLeader";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import GuestPlayersInBooking from "./GuestPlayersInBooking";
import useGuest from "~/hooks/useGuest";

export type Props = {
  booking: Booking;
};

export const PlayerSection = ({ booking }: Props) => {
  const {
    usersInBooking,
    isInitialLoadingUsersInBooking,
    isUsersInBookingFetched,
  } = useUsersInBooking({ booking });

  const { allGuestsInBooking, isGuestFetched } = useGuest({
    bookingId: booking.id,
  });

  return (
    <div className="self-start pt-2">
      {isInitialLoadingUsersInBooking ||
      !isUsersInBookingFetched ||
      !isGuestFetched ? (
        <div className="flex justify-start">
          <BeatLoader size={10} color="#36d7b7" />
        </div>
      ) : (
        <div className="smooth-render-in ">
          <PartyLeader users={usersInBooking as User[]} booking={booking} />
          <PlayersInBooking
            users={usersInBooking as User[]}
            booking={booking}
          />
          <GuestPlayersInBooking
            guests={allGuestsInBooking}
            booking={booking}
          />
        </div>
      )}
    </div>
  );
};
