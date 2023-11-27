import { type Booking, type Facility } from "@prisma/client";

export type Props = {
  booking: Booking;
  facilities?: Facility[];
};

export const DurationAndCourtSection = ({ booking }: Props) => {
  return (
    <div className="flex flex-col self-center">
      {!!booking.duration && (
        <div className="self-center">{booking.duration} min</div>
      )}
      {booking.court && (
        <div className="self-center">Court {booking.court}</div>
      )}
    </div>
  );
};
