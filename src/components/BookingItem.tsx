import {
  type User,
  type Booking,
  type Association,
  type Facility,
} from "@prisma/client";
import { type BookingAction, isOngoingGame } from "~/utils/booking.util";
import { OngoingGame } from "./OngoingGame";
import Link from "next/link";
import { parseDate, parseTime } from "~/utils/time.util";
import { AssociationSection } from "./AssociationSection";
import { FacilitySection } from "./FacilitySection";
import { PlayerSection } from "./PlayerSection";
import { DurationAndCourtSection } from "./DurationAndCourtSection";
import { ActionPanelSection } from "./ActionPanelSection";
import { CustomIcon } from "./CustomIcon";
import { type NextRouter } from "next/router";
import useGuest from "~/hooks/useGuest";
import { BeatLoader } from "react-spinners";

type Props = {
  booking: Booking;
  sessionUser?: User | null | undefined;
  joining: BookingAction;
  leaving: BookingAction;
  deleting: BookingAction;
  router: NextRouter;
  associations: Association[];
  facilities: Facility[];
  onBookingItemChange: (booking: Booking) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BookingItem = ({
  booking,
  sessionUser,
  joining,
  leaving,
  deleting,
  associations,
  facilities,
  onBookingItemChange,
}: Props) => {
  const { allGuestsInBooking, isAllGuestsInBookingFetched } = useGuest({
    bookingId: booking.id,
  });

  const showLink =
    (sessionUser && booking.players.includes(sessionUser.id)) ||
    booking.userId === sessionUser?.id ||
    allGuestsInBooking?.some((guest) => guest.invitedBy === sessionUser?.id);
  const guestPlayersLength = allGuestsInBooking?.length
    ? allGuestsInBooking?.length
    : 0;
  const totalPlayersLength = booking.players.length + guestPlayersLength;
  return (
    <div
      key={booking?.id}
      className="smooth-render-in first:border-b-1 border-b border-zinc-400"
    >
      <div className="card-compact card">
        <div
          className={`card-body flex-row justify-between text-primary-content`}
        >
          <div className="flex flex-col">
            {isOngoingGame(booking) && <OngoingGame />}
            <div>
              {showLink ? (
                <Link
                  href={`/booking/details/${booking.id}`}
                  className="font-bil link card-title text-2xl font-bold"
                >
                  {parseDate(booking)}
                  {totalPlayersLength === 4 && " ✅"}
                </Link>
              ) : (
                <div className="font-bil card-title text-2xl font-bold">
                  {parseDate(booking)}
                  {totalPlayersLength === 4 && " ✅"}
                </div>
              )}
              <div className="flex flex-col pb-1 font-medium">
                <div className="flex flex-row self-start pb-2">
                  <CustomIcon path="/svg/duration.svg" width={20} />
                  <div className="pl-1 text-lg">{parseTime(booking)}</div>
                </div>

                <div
                  style={{ maxWidth: "150px" }}
                  className="transparent-background-grey self-start rounded-lg border border-slate-600 p-1"
                >
                  {booking.associationId &&
                    sessionUser?.associations.includes(
                      booking.associationId
                    ) && (
                      <AssociationSection
                        booking={booking}
                        associations={associations}
                      />
                    )}
                  {booking.facilityId && (
                    <FacilitySection
                      facilities={facilities}
                      booking={booking}
                    />
                  )}
                </div>
              </div>
              {sessionUser?.id && <PlayerSection booking={booking} />}
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-col self-end pb-2">
              <DurationAndCourtSection booking={booking} />
              {isAllGuestsInBookingFetched ? (
                <ActionPanelSection
                  leaving={leaving}
                  joining={joining}
                  deleting={deleting}
                  booking={booking}
                  guestPlayers={allGuestsInBooking}
                  sessionUserId={sessionUser?.id}
                  onBookingChange={onBookingItemChange}
                />
              ) : (
                <div className="flex h-[148px] w-[70px] flex-col items-center justify-center">
                  <BeatLoader size={10} color="cyan" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
