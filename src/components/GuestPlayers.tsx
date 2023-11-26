import { type Booking } from "@prisma/client";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { Toast } from "./Toast";
import { getEmailRecipients, renderToast } from "~/utils/general.util";
import { useSession } from "next-auth/react";
import ActionModal from "./ActionModal";
import useBooking from "~/hooks/useBooking";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import BeatLoaderButton from "./BeatLoaderButton";
import useGuest from "~/hooks/useGuest";
import { emailDispatcher } from "~/utils/booking.util";
import useEmail from "~/hooks/useEmail";

type UserInBooking = {
  id: string;
  emailConsents: string[];
  name: string | null;
  image: string | null;
};

type Props = {
  booking: Booking;
  users: UserInBooking[];
};

export const GuestPlayers = ({ booking, users }: Props) => {
  const session = useSession();
  const { sendEmail } = useEmail();

  const [playersInBooking, setPlayersInBooking] = useState<
    UserInBooking[] | undefined
  >();
  const [toastMessage, setToastMessage] = useState<string>();

  const [guestName, setGuestName] = useState<string>();

  const { isInitialLoadingRefetch } = useBooking();

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

  const onGuestAddClick = async () => {
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

      renderToast("Guest added", setToastMessage);

      const recipients = getEmailRecipients({
        users: users,
        playersInBooking: booking?.players,
        sessionUserId: session?.data?.user.id as string,
        eventType: "JOIN",
      });

      emailDispatcher({
        originalBooking: booking,
        mutatedBooking: booking,
        bookerName: undefined,
        playerName: guest.name,
        bookings: [],
        eventType: "JOIN",
        recipients,
        sendEmail,
      });
    }
  };

  const onGuestRemoveClick = async () => {
    if (!guestToRemove) {
      return null;
    }
    setIsLoading(true);
    const deletedGuest = await deleteGuest({ id: guestToRemove });
    await refetchAllGuestsInBooking();
    setGuestToRemove(undefined);
    setIsLoading(false);
    renderToast("Guest removed", setToastMessage);

    const recipients = getEmailRecipients({
      users: users,
      playersInBooking: booking?.players,
      sessionUserId: session?.data?.user.id as string,
      eventType: "LEAVE",
    });
    emailDispatcher({
      originalBooking: booking,
      mutatedBooking: booking,
      bookerName: undefined,
      playerName: deletedGuest.name,
      bookings: [],
      eventType: "LEAVE",
      recipients,
      sendEmail,
    });
  };

  useEffect(() => {
    setPlayersInBooking(
      usersInBooking?.filter((user) => booking.players.includes(user.id))
    );
  }, [booking, usersInBooking]);

  return (
    <div>
      {toastMessage && <Toast body={toastMessage} />}
      <ActionModal
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        callback={onGuestRemoveClick}
        tagRef="guest-remove"
        title="Confirm removal 🦵👋"
        level="error"
        body="The other players in this booking will get notified by email that a player has left. Try to find a replacement"
        confirmButtonText="Remove"
        cancelButtonText="Cancel"
      />
      <ActionModal
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        callback={onGuestAddClick}
        tagRef="guest-add"
        level="success"
        title="Confirm guest"
        body="The other players in this booking will get notified by email."
        confirmButtonText="Add"
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
                        disabled
                        maxLength={30}
                        value={guest.name}
                        placeholder="Name"
                        className="input-bordered input"
                      />
                    </div>
                    {guest.invitedBy === session.data?.user.id && (
                      <label
                        htmlFor="action-modal-guest-remove"
                        className={`btn-error btn-sm btn min-w-[78px] self-center ${
                          isLoading ? "btn-disabled" : ""
                        }`}
                        onClick={() => setGuestToRemove(guest.id)}
                      >
                        <BeatLoaderButton
                          value="Remove"
                          isLoading={isLoading && guestToRemove === guest.id}
                        />
                      </label>
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
              {session.data?.user.id &&
                booking.players.includes(session.data.user.id) && (
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
                    <label
                      htmlFor="action-modal-guest-add"
                      className={`btn-success btn-sm btn min-w-[70px] self-center ${
                        isLoading ||
                        guestToRemove !== undefined ||
                        !guestName?.length
                          ? "btn-disabled"
                          : ""
                      }`}
                    >
                      <BeatLoaderButton
                        value="Add"
                        isLoading={isLoading && !guestToRemove}
                      />
                    </label>
                  </div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
