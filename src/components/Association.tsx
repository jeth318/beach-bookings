import { type User, type Booking, type Association } from "@prisma/client";
import { CustomIcon } from "./CustomIcon";

export type Props = {
  user: User;
  group: Association;
};

export const Group = ({ user, group }: Props) => {
  return (
    <div
      key={user.id}
      style={{ marginTop: "-15" }}
      className="smooth-render-in-slower flex flex-row items-center"
    >
      {group.name}
    </div>
  );
};
