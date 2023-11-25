import { type Booking, type Association } from "@prisma/client";
import { CustomIcon } from "./CustomIcon";
import { getAssociationById } from "~/utils/association.util";
import { BeatLoader } from "react-spinners";

export type Props = {
  booking: Booking;
  associations?: Association[];
  isLoading?: boolean;
};

export const AssociationSection = ({
  booking,
  associations,
  isLoading,
}: Props) => {
  return (
    <div className="flex flex-row items-center self-start pb-1 ">
      <span className="pr-1">
        <CustomIcon path="/svg/people.svg" width={20} />
      </span>
      <div style={{ maxWidth: 100 }} className="overflow-dots">
        {isLoading ? (
          <BeatLoader size={6} color="white" />
        ) : (
          getAssociationById(booking?.associationId, associations)?.name
        )}
      </div>
    </div>
  );
};
