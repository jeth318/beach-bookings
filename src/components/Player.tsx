import { type User, type Booking } from "@prisma/client";
import { CustomIcon } from "./CustomIcon";

export type Props = {
  user: User;
  booking: Booking;
};

export const Player = ({ user, booking }: Props) => {
  const displayName =
    user.name && user.name.length > 2
      ? user.name
      : `Player-${user.id.slice(0, 5)}`;
  return (
    <div
      key={user.id}
      style={{ marginTop: "-15" }}
      className="smooth-render-in-slower flex flex-row items-center"
    >
      {displayName}
      {booking.userId === user.id && (
        <div className="pl-2">
          <CustomIcon path="/svg/crown.svg" width={17} />
        </div>
      )}
    </div>
  );
};
