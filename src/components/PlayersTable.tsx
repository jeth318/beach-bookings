import { type Guest, type Booking } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "~/utils/api";
import { Toast } from "./Toast";
import { CustomIcon } from "./CustomIcon";
import { getEmailRecipients } from "~/utils/general.util";
import { emailDispatcher } from "~/utils/booking.util";
import { useSession } from "next-auth/react";
import ActionModal from "./ActionModal";
import useBooking from "~/hooks/useBooking";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import useEmail from "~/hooks/useEmail";
import useGuest from "~/hooks/useGuest";

type Props = {
  guests: Guest[] | undefined;
  booking: Booking;
};

export const PlayersTable = ({ booking, guests = [] }: Props) => {
  const session = useSession();

  type PlayerInBooking = {
    id: string;
    emailConsents: string[];
    name: string | null;
    image: string | null;
    isGuest: boolean;
  };

  const [playersInBooking, setPlayersInBooking] = useState<
    PlayerInBooking[] | undefined
  >();
  const [toastMessage, setToastMessage] = useState<string>();

  const { refetchBookings, isInitialLoadingRefetch } = useBooking();

  const { sendEmail } = useEmail();

  const { allGuestsInBooking, deleteGuest, refetchAllGuestsInBooking } =
    useGuest({
      bookingId: booking.id,
    });

  const updateBooking = api.booking.update.useMutation();

  const { usersInBooking, isInitialLoadingUsersInBooking } = useUsersInBooking({
    booking,
  });
  const [playerToRemove, setPlayerToRemove] = useState<string | undefined>();

  const booker = usersInBooking?.find((user) => user.id === booking.userId);

  const getAddedBy = (guestPlayer: PlayerInBooking) => {
    const guest = allGuestsInBooking?.find((g) => g.id === guestPlayer.id);
    const adder = usersInBooking?.find((user) => user?.id === guest?.invitedBy);
    const displayName =
      adder?.id === session.data?.user.id
        ? "you"
        : getDisplayName(adder as PlayerInBooking);
    return adder?.name
      ? `Added by ${displayName || "unknown player"}`
      : "Added by former player";
  };
  useEffect(() => {
    const og =
      usersInBooking

        ?.filter((user) => booking.players.includes(user.id))
        .filter((user) => user.id !== booking.userId)
        .map((user) => {
          return {
            ...user,
            isGuest: false,
          };
        }) || [];

    const g = guests.map((guest) => {
      return {
        id: guest.id,
        name: guest.name,
        isGuest: true,
      } as PlayerInBooking;
    });
    setPlayersInBooking([...og, ...g]);
  }, [booking, usersInBooking, guests]);

  const getDisplayName = (player: PlayerInBooking) =>
    player?.name && player?.name?.length > 2
      ? player?.name
      : `Player${player?.id?.slice(0, 3)}`;

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

  const removePlayer = (playerId: string) => {
    const isRegularPlayer = booking.players.includes(playerId);
    return isRegularPlayer
      ? removeRegularPlayer(playerId)
      : removeGuestPlayer(playerId);
  };

  const removeRegularPlayer = (playerId: string) => {
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
            guests: allGuestsInBooking,
            associationId: booking.associationId,
            sendEmail,
          });
          renderToast(`Player was removed from the booking.`);
          void refetchBookings();
        },
      }
    );
  };

  const removeGuestPlayer = async (playerId: string) => {
    const recipients = getEmailRecipients({
      playersInBooking: booking.players,
      users: playersInBooking || [],
      sessionUserId: "",
      eventType: "KICK",
    });

    const deletedUser = await deleteGuest({ id: playerId });

    if (deletedUser) {
      emailDispatcher({
        recipients,
        playerName: session.data?.user.id || "A player",
        originalBooking: booking,
        mutatedBooking: booking,
        eventType: "KICK",
        associationId: booking.associationId,
        sendEmail,
      });
      renderToast(`Player was removed from the booking.`);
      void refetchBookings();
      void refetchAllGuestsInBooking();
    }
  };

  return (
    <div>
      {toastMessage && <Toast body={toastMessage} />}
      <ActionModal
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        callback={removePlayer}
        data={playerToRemove}
        tagRef="player-remove"
        title="Confirm removal 👋"
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
        <div className="max-h- overflow-x-auto">
          <table className="table-xs table-pin-rows table-pin-cols table w-full">
            <thead>
              <tr>
                <td colSpan={3} className="text-md text-center text-xl">
                  Players
                </td>
              </tr>
            </thead>
            <tbody>
              {!!booker && (
                <tr key={"jek"}>
                  <td className="flex-flow flex items-center p-1 pl-2 pr-2">
                    <div className="flex w-full flex-row items-center justify-between">
                      <div className="flex flex-row items-center">
                        <div className="avatar">
                          <div className="mask mask-squircle mr-2 h-12 w-12">
                            <Image
                              height={100}
                              width={100}
                              alt="user-icon-default"
                              src={booker.image || "/user-default.png"}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div
                            style={{
                              overflow: "hidden",
                              maxWidth: "170px",
                              textOverflow: "ellipsis",
                            }}
                            className="font-bold"
                          >
                            {getDisplayName(booker as PlayerInBooking)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-1 flex items-center gap-2">
                        <div>Booker</div>
                        <CustomIcon path="/svg/crown.svg" />
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {playersInBooking?.map((player) => {
                return (
                  <tr key={player.id}>
                    <td className="flex-flow flex items-center p-1 pl-2 pr-2">
                      <div className="flex w-full flex-row items-center">
                        <div className="avatar">
                          <div className="mask mask-squircle mr-2 h-12 w-12">
                            <Image
                              height={100}
                              width={100}
                              alt="user-icon-default"
                              src={player.image || "/user-default.png"}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div
                            style={{
                              overflow: "hidden",
                              maxWidth: "180px",
                              textOverflow: "ellipsis",
                            }}
                            className="font-bold"
                          >
                            {getDisplayName(player)}
                            {player.isGuest && (
                              <span className="ml-2">
                                <i>(guest)</i>
                              </span>
                            )}
                          </div>
                          <div
                            className="ellips text-sm opacity-50"
                            style={{
                              overflow: "hidden",
                              maxWidth: "175px",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {player.isGuest ? getAddedBy(player) : ""}
                          </div>
                        </div>
                      </div>

                      {session.data?.user.id === booking.userId &&
                        playersInBooking.length >= 2 && (
                          <label
                            onClick={() => setPlayerToRemove(player.id)}
                            className="btn-outline btn-sm btn"
                            htmlFor="action-modal-player-remove"
                          >
                            Bye 👋
                          </label>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
