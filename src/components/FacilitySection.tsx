import { type Booking, type Facility } from "@prisma/client";
import { CustomIcon } from "./CustomIcon";
import { getFacility } from "~/utils/facility.util";

export type Props = {
  booking: Booking;
  facilities?: Facility[];
};

export const FacilitySection = ({ booking, facilities }: Props) => {
  return (
    <div className="flex flex-row items-center justify-start">
      <div className="flex flex-row items-center">
        {/*         <span className="pr-1">
          <CustomIcon path="/svg/location-arrow.svg" width={20} />
        </span> */}
        <div className="mr-2">
          <CustomIcon
            rounded
            alt="Game has costs"
            path="/beach-center-logo.png"
            width={18}
          />
        </div>
        {getFacility(booking?.facilityId, facilities)?.name}
      </div>
      {!!getFacility(booking?.facilityId)?.durations.length && (
        <span className="pl-2">
          <CustomIcon alt="Game has costs" path="/svg/coins.svg" width={18} />
        </span>
      )}
    </div>
  );
};
