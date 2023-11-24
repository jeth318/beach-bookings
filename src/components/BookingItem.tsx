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
  router,
  associations,
  facilities,
  onBookingItemChange,
}: Props) => {
  console.log(booking.userId === sessionUser?.id);

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
              {(sessionUser && booking.players.includes(sessionUser.id)) ||
              booking.userId === sessionUser?.id ? (
                <Link
                  href={`/booking/details/${booking.id}`}
                  className="font-bil link card-title text-2xl font-bold"
                >
                  {parseDate(booking)}
                  {booking.players.length === 4 && " ✅"}
                </Link>
              ) : (
                <div className="font-bil card-title text-2xl font-bold">
                  {parseDate(booking)}
                  {booking.players.length === 4 && " ✅"}
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
              <ActionPanelSection
                isMainPage={router.asPath === "/"}
                leaving={leaving}
                joining={joining}
                deleting={deleting}
                booking={booking}
                sessionUserId={sessionUser?.id}
                onBookingChange={onBookingItemChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
