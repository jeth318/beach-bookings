import { type Guest, type Booking } from "@prisma/client";
import Link from "next/link";
import { BeatLoader } from "react-spinners";
import {
  type BookingAction,
  getJoinButtonClassName,
  getJoinButtonText,
  getProgressAccent,
  isOngoingGame,
} from "~/utils/booking.util";
import BeatLoaderButton from "./BeatLoaderButton";
import { useRouter } from "next/router";

export type Props = {
  booking: Booking;
  guestPlayers?: Guest[];
  maxPlayers?: number;
  sessionUserId?: string;
  joining: BookingAction;
  leaving: BookingAction;
  deleting: BookingAction;
  onBookingChange: (booking: Booking) => void;
};

export const ActionPanelSection = ({
  booking,
  maxPlayers,
  sessionUserId,
  leaving,
  joining,
  deleting,
  guestPlayers,
  onBookingChange,
}: Props) => {
  const router = useRouter();
  const guestPlayerCount = Number(guestPlayers?.length) || 0;
  const radialProgressValue =
    (!maxPlayers
      ? 100
      : (booking.players.length + guestPlayerCount) / maxPlayers) * 100;

  const totalPlayerCount = booking.maxPlayers
    ? `${booking.players.length + guestPlayerCount} / ${booking.maxPlayers}`
    : booking.players.length;

  const isMainPage = router.isReady && router.asPath === "/";

  if (!router.isReady) {
    return null;
  }

  return (
    <div className="smooth-render-in mt-3 flex flex-col self-center">
      <div
        className={`radial-progress self-center text-lg font-bold ${getProgressAccent(
          booking,
          guestPlayers?.length || 0
        )}`}
        style={{
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          "--value": radialProgressValue,
          "--thickness": "3px",
        }}
      >
        {totalPlayerCount}
      </div>

      {sessionUserId ? (
        <div
          style={{ width: "auto" }}
          className="smooth-render-in-slower btn-group btn-group-vertical mt-4 flex"
        >
          {booking.players.includes(sessionUserId) &&
            !isOngoingGame(booking) && (
              <>
                <label
                  htmlFor="action-modal-leave-booking"
                  onClick={() => void onBookingChange(booking)}
                  className="btn-warning btn-sm btn "
                >
                  {leaving.isWorking && booking.id === leaving.bookingId ? (
                    <BeatLoader size={10} color="white" />
                  ) : (
                    "Leave"
                  )}
                </label>
              </>
            )}

          {!booking.players.includes(sessionUserId) &&
            !isOngoingGame(booking) && (
              <label
                htmlFor="action-modal-join-booking"
                onClick={() => void onBookingChange(booking)}
                className={getJoinButtonClassName(
                  booking,
                  guestPlayerCount,
                  sessionUserId
                )}
              >
                <BeatLoaderButton
                  value={getJoinButtonText(
                    booking,
                    guestPlayerCount,
                    sessionUserId
                  )}
                  isLoading={
                    joining.bookingId === booking.id && joining.isWorking
                  }
                />
              </label>
            )}

          {!isMainPage && sessionUserId === booking?.userId && (
            <button className="btn-sm btn ">
              <Link
                href={{
                  pathname: `/booking/${booking.id}`,
                }}
              >
                Edit
              </Link>
            </button>
          )}
          {!isMainPage && sessionUserId === booking?.userId && (
            <label
              htmlFor="action-modal-delete-booking"
              onClick={() => void onBookingChange(booking)}
              className="btn-error btn-sm btn "
            >
              {deleting.isWorking && booking.id === deleting.bookingId ? (
                <BeatLoader size={10} color="white" />
              ) : (
                "Delete"
              )}
            </label>
          )}
        </div>
      ) : null}
    </div>
  );
};
