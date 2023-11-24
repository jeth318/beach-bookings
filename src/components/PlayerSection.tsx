import { type User, type Booking } from "@prisma/client";
import { BeatLoader } from "react-spinners";
import PlayersInBooking from "./PlayersInBooking";
import { PartyLeader } from "./PartyLeader";

export type Props = {
  users: User[];
  booking: Booking;
  isInitialLoadingUsers?: boolean;
};

export const PlayerSection = ({
  users,
  booking,
  isInitialLoadingUsers,
}: Props) => {
  return (
    <div className="self-start pt-2">
      {isInitialLoadingUsers ? (
        <div className="flex justify-start">
          <BeatLoader size={10} color="#36d7b7" />
        </div>
      ) : (
        <>
          <PartyLeader users={users} booking={booking} />
          <PlayersInBooking users={users} booking={booking} />
        </>
      )}
    </div>
  );
};
