import { type Booking } from "@prisma/client";
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
import useUser from "~/hooks/useUser";
import useSessionUser from "~/hooks/useSessionUser";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import useEmail from "~/hooks/useEmail";

type Props = {
  booking: Booking;
};

export const PlayersTable = ({ booking }: Props) => {
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
        playersInBooking?.map((player, index) => {
          const displayName =
            player.name && player.name.length > 2
              ? player.name?.split(" ")[0]
              : `Player${player.id.slice(0, 3)}`;
          console.log("player.id", `${player.id}-${index}`);

          return (
            <div
              key={player.id}
              style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
              className="flex flex-row justify-between bg-slate-200 dark:bg-slate-800"
            >
              <div className="flex items-center space-x-3">
                <div className="avatar">
                  <div className="mask mask-squircle h-12 w-12">
                    <Image
                      height={100}
                      width={100}
                      alt="user-icon-default"
                      src={player.image || "/user-default.png"}
                    />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      overflow: "hidden",
                      maxWidth: "150px",
                      textOverflow: "ellipsis",
                    }}
                    className="font-bold"
                  >
                    {displayName}
                  </div>
                  <div
                    className="ellips text-sm opacity-50"
                    style={{
                      overflow: "hidden",
                      maxWidth: "150px",
                      textOverflow: "ellipsis",
                    }}
                  >
                    playeremail
                  </div>
                </div>
              </div>
              <div
                className="flex  items-center justify-between gap-2 self-center pr-2"
                style={{ textAlign: "center" }}
              >
                {player.id === booking.userId && (
                  <div className="flex items-center gap-2">
                    <div>Booker</div>
                    <CustomIcon path="/svg/crown.svg" />
                  </div>
                )}
                {player.id !== session.data?.user.id && (
                  <>
                    <div className="br-3 flex flex-row gap-2">
                      {/* {player.email && (
                          <a
                            className="btn-outline btn btn-accent btn-sm"
                            href={`sms:${""}`}
                          >
                            SMS
                          </a>
                        )}
                        {player.email && (
                          <a
                            className="btn-outline btn btn-info btn-sm text-white"
                            href={`mailto:${
                              player.email || ""
                            }?subject=Regarding the booking on ${booking.date.toDateString()}`}
                          >
                            EMAIL
                          </a>
                        )} */}
                    </div>
                    {session.data?.user.id === booking.userId &&
                      playersInBooking.length >= 2 && (
                        <label
                          onClick={() => setPlayerToRemove(player.id)}
                          className="btn-outline btn btn-sm"
                          htmlFor="action-modal-player-remove"
                        >
                          Kick 👋
                        </label>
                      )}
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
