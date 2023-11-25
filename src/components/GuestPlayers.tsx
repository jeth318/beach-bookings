import { type Booking } from "@prisma/client";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "~/utils/api";
import { Toast } from "./Toast";
import { getEmailRecipients, renderToast } from "~/utils/general.util";
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
    }
  };

  const onGuestRemoveClick = async () => {
    if (!guestToRemove) {
      return null;
    }
    setIsLoading(true);
    await deleteGuest({ id: guestToRemove });
    await refetchAllGuestsInBooking();
    setGuestToRemove(undefined);
    setIsLoading(false);
    renderToast("Guest removed", setToastMessage);
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
        title="Confirm kick 🦵👋"
        body="If you remove this guest from this booking, he or she will have to
        re-join them selfs."
        confirmButtonText="Remove guest"
        cancelButtonText="Cancel"
      />
      <ActionModal
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        callback={onGuestAddClick}
        tagRef="guest-add"
        title="Confirm new guest"
        body="The other players in this booking will get notified by email."
        confirmButtonText="Add guest"
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
                      <label
                        htmlFor="action-modal-guest-remove"
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        // disabled={isLoading || guestToRemove !== undefined}
                        className={`btn-warning btn-sm btn min-w-[78px] self-center ${
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
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  htmlFor="action-modal-guest-add"
                  /* disabled={
                    isLoading ||
                    guestToRemove !== undefined ||
                    !guestName?.length
                  } */
                  className={`btn-accent btn-sm btn min-w-[70px] self-center ${
                    isLoading ? "btn-disabled" : ""
                  }`}
                >
                  <BeatLoaderButton
                    value="Add"
                    isLoading={isLoading && !guestToRemove}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
