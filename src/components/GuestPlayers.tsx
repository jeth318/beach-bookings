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
import BeatLoaderButton from "./BeatLoaderButton";
import useGuest from "~/hooks/useGuest";

type Props = {
  booking: Booking;
};

export const GuestPlayers = ({ booking }: Props) => {
  const session = useSession();

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
  const [guestToRemove, setGuestToRemove] = useState<string | undefined>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    createGuest,
    refetchAllGuestsInBooking,
    deleteGuest,
    allGuestsInBooking: guests,
  } = useGuest({
    bookingId: booking?.id,
  });

  const userGuests = guests?.filter(
    (g) => g.invitedBy === session?.data?.user.id
  );

  const onGuestAddClick = async (guestName: string) => {
    if (!booking?.id) {
      return null;
    }
    setIsLoading(true);
    const guest = await createGuest({
      bookingId: booking?.id,
      name: guestName || "",
    });
    if (guest.id) {
      await refetchAllGuestsInBooking();
      setGuestName("");
      setIsLoading(false);
    }
  };

  const onGuestRemoveClick = async (id: string) => {
    if (!id) {
      return null;
    }
    setGuestToRemove(id);
    await deleteGuest({ id });
    await refetchAllGuestsInBooking();
    setGuestToRemove(undefined);
  };

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

  return (
    <div>
      {toastMessage && <Toast body={toastMessage} />}
      <ActionModal
        callback={removePlayer}
        tagRef="player-remove"
        title="Confirm kick 🦵👋"
        body="If you remove this guest from this booking, he or she will have to
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
          {userGuests &&
            userGuests?.map((guest, index) => {
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
                        onClick={() => onGuestRemoveClick(guest.id)}
                        disabled={isLoading || guestToRemove !== undefined}
                        className="btn-warning btn-sm btn min-w-[78px] self-center"
                      >
                        <BeatLoaderButton
                          value="Remove"
                          isLoading={guestToRemove === guest.id}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          {booking.players.length + Number(guests?.length) <
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
                    disabled={isLoading}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="New guest name"
                    className="input-bordered input"
                  />
                </div>
                <button
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={() => onGuestAddClick(guestName || "")}
                  disabled={
                    isLoading ||
                    guestToRemove !== undefined ||
                    !guestName?.length
                  }
                  className="btn-accent btn-sm btn min-w-[70px] self-center"
                >
                  <BeatLoaderButton value="Add" isLoading={isLoading} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
