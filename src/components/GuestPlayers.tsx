import { type Booking } from "@prisma/client";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "~/utils/api";
import { Toast } from "./Toast";
import { getEmailRecipients } from "~/utils/general.util";
import { emailDispatcher } from "~/utils/booking.util";
import { useSession } from "next-auth/react";
import ActionModal from "./ActionModal";
import useBooking from "~/hooks/useBooking";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import useEmail from "~/hooks/useEmail";
import useGuest from "~/hooks/useGuest";

type Props = {
  booking: Booking;
};

export const GuestPlayers = ({ booking }: Props) => {
  const session = useSession();

  const {
    createGuest,
    deleteGuest,
    refetchAllGuestsInBooking,
    allGuestsInBooking,
  } = useGuest({
    bookingId: booking?.id,
  });

  console.log({ allGuestsInBooking });

  type PlayerInBooking = {
    id: string;
    emailConsents: string[];
    name: string | null;
    image: string | null;
  };

  const [playersInBooking, setPlayersInBooking] = useState<
    PlayerInBooking[] | undefined
  >();
  const [toastMessage, setToastMessage] = useState<string>();

  const [guestName, setGuestName] = useState<string>();

  const { refetchBookings, isInitialLoadingRefetch } = useBooking();

  const { sendEmail } = useEmail();

  const updateBooking = api.booking.update.useMutation();

  const { usersInBooking, isInitialLoadingUsersInBooking } = useUsersInBooking({
    booking,
  });
  const [playerToRemove, setPlayerToRemove] = useState<string | undefined>();

  useEffect(() => {
    setPlayersInBooking(
      usersInBooking?.filter((user) => booking.players.includes(user.id))
    );
  }, [booking, usersInBooking]);

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

  const removePlayer = (playerId: string) => {
    const recipients = getEmailRecipients({
      playersInBooking: booking.players,
      users: playersInBooking || [],
      sessionUserId: "",
      eventType: "KICK",
    });

    void updateBooking.mutate(
      {
        ...booking,
        players: booking.players.filter((id) => id !== playerId),
        association: booking.associationId,
        facility: booking.facilityId,
      },
      {
        onSuccess: (mutatedBooking: Booking) => {
          setPlayersInBooking(
            playersInBooking?.filter((player) => player.id !== playerId)
          );
          emailDispatcher({
            recipients,
            playerName: session.data?.user.id || "A player",
            originalBooking: booking,
            mutatedBooking,
            eventType: "KICK",
            sendEmail,
          });
          renderToast(`Player was removed from the booking.`);
          void refetchBookings();
        },
      }
    );
  };

  const availableSpots = Array.from(
    Array(Number(booking.maxPlayers) - Number(booking.players.length)).keys()
  );

  const onAddGuestClicked = async () => {
    if (!booking.id) {
      return null;
    }
    await createGuest({ bookingId: booking?.id, name: guestName || "" });
    await refetchAllGuestsInBooking();
  };

  const onKickGuestClicked = async (id: string) => {
    if (!id) {
      return null;
    }
    await deleteGuest({ id });
    await refetchAllGuestsInBooking();
  };

  return (
    <div>
      {toastMessage && <Toast body={toastMessage} />}
      <ActionModal
        callback={removePlayer}
        data={playerToRemove}
        tagRef="player-remove"
        title="Confirm kick 🦵👋"
        body="If you remove this player from this booking, he or she will have to
        re-join them selfs."
        confirmButtonText="Remove player"
        cancelButtonText="Cancel"
      />

      {!playersInBooking ||
      isInitialLoadingRefetch ||
      isInitialLoadingUsersInBooking ? (
        <div className="flex justify-center">
          <BeatLoader size={20} color="#36d7b7" />
        </div>
      ) : (
        <div>
          {allGuestsInBooking &&
            allGuestsInBooking?.map((guest, index) => {
              return (
                <div
                  key={index}
                  style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
                  className="flex flex-row justify-between bg-slate-200 dark:bg-slate-800"
                >
                  <div className="flex w-full items-center space-x-3 pr-2">
                    <div className="flex w-full flex-col gap-1">
                      <input
                        style={{ width: "100%" }}
                        type="text"
                        maxLength={30}
                        disabled
                        value={guest.name}
                        placeholder="Name"
                        className="input-bordered input"
                      />
                    </div>
                    {guest.invitedBy === session.data?.user.id && (
                      <button
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={() => onKickGuestClicked(guest.id)}
                        className="btn-warning btn-sm btn self-center "
                      >
                        Kick
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {booking.players.length + Number(allGuestsInBooking?.length) <
            Number(booking?.maxPlayers) && (
            <div
              style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
              className="flex flex-row justify-between bg-slate-200 dark:bg-slate-800"
            >
              <div className="flex w-full items-center space-x-3 pr-2">
                <div className="flex w-full flex-col gap-1">
                  <input
                    style={{ width: "100%" }}
                    type="text"
                    maxLength={30}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="New guest name"
                    className="input-bordered input"
                  />
                </div>
                <button
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={onAddGuestClicked}
                  className="btn-accent btn-sm btn self-center"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
