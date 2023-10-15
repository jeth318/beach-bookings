import { type Booking, type User } from "@prisma/client";
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

type Props = {
  booking: Booking;
};

type GuestPlayer = {
  name?: string;
  email?: string;
};

export const PlayersTable = ({ booking }: Props) => {
  const [playersInBooking, setPlayersInBooking] = useState<User[]>();
  const [toastMessage, setToastMessage] = useState<string>();

  const session = useSession();

  const {
    refetch: refetchBookings,
    isInitialLoading: isInitialLodaingBookings,
  } = api.booking.getAll.useQuery();

  const emailerMutation = api.emailer.sendEmail.useMutation();

  const updateBooking = api.booking.update.useMutation();
  const { data: users, isInitialLoading: isInitialLodaingUsers } =
    api.user.getAll.useQuery();
  const [playerToRemove, setPlayerToRemove] = useState<string | undefined>();
  const [guestPlayerEmail, setGuestPlayerEmail] = useState<
    string | undefined
  >();
  const [guestPlayerName, setGuestPlayerName] = useState<string | undefined>();

  const [guestPlayerToJoin, setGuestPlayerToJoin] = useState<
    GuestPlayer | undefined
  >();

  useEffect(() => {
    setPlayersInBooking(
      users?.filter((user) => booking.players.includes(user.id))
    );
  }, [booking, users]);

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

  const removePlayer = (playerId: string) => {
    const recipients = getEmailRecipients({
      booking,
      users: users || [],
      sessionUserId: "",
      eventType: "KICK",
    });

    const guestPlayerJoin = (playerId: string) => {
      const recipients = getEmailRecipients({
        booking,
        users: users || [],
        sessionUserId: "",
        eventType: "JOIN",
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
              mutation: emailerMutation,
            });
            renderToast(`Player was removed from the booking.`);
            void refetchBookings();
          },
        }
      );
    };

    const canAddPlayer =
      typeof booking.maxPlayers === "number"
        ? booking.maxPlayers - Number(playersInBooking?.length)
        : true;

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

        <ActionModal
          callback={guestPlayerJoin}
          data={guestPlayerToJoin}
          tagRef="guest-join"
          title="Confirm guest player join 🦵👋"
          body="If you add this guest player, the other people in this booking will get notified by email. He or she won't be able to leave. As the booking owner, you are the only one who can add/remove guests."
          confirmButtonText="Join guest player"
          cancelButtonText="Cancel"
        />

        {!playersInBooking ||
        isInitialLodaingBookings ||
        isInitialLodaingUsers ? (
          <div className="flex justify-center">
            <BeatLoader size={20} color="#36d7b7" />
          </div>
        ) : (
          <>
            {playersInBooking?.map((player) => {
              return (
                <div
                  key={player.id}
                  style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
                  className="flex flex-row justify-between bg-slate-200 p-2 dark:bg-slate-800"
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
                        {player.name}
                      </div>
                      <div
                        className="text-sm opacity-50"
                        style={{
                          overflow: "hidden",
                          maxWidth: "150px",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {player.email}
                      </div>
                    </div>
                  </div>
                  <div
                    className="self-center pr-2"
                    style={{ textAlign: "center" }}
                  >
                    {playersInBooking.length >= 2 ? (
                      <label
                        onClick={() => setPlayerToRemove(player.id)}
                        className="btn-outline btn-sm btn"
                        htmlFor="action-modal-player-remove"
                      >
                        Kick 👋
                      </label>
                    ) : (
                      <div>
                        <CustomIcon path="/svg/crown.svg" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {canAddPlayer && (
              <div
                style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
                className="flex flex-row justify-between bg-slate-200 p-2 dark:bg-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="avatar">
                    <div className="mask mask-squircle h-12 w-12">
                      <Image
                        height={100}
                        width={100}
                        alt="user-icon-default"
                        src="/user-default.png"
                      />
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        overflow: "hidden",
                        maxWidth: "150px",
                        marginBottom: "5px",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Name"
                        onChange={(e) => setGuestPlayerEmail(e.target.value)}
                        className="input-bordered input input-sm w-full"
                      />
                    </div>
                    <div
                      className="text-sm opacity-50"
                      style={{
                        overflow: "hidden",
                        maxWidth: "150px",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Name"
                        onChange={(e) => setGuestPlayerName(e.target.value)}
                        className="input-bordered input input-sm w-full"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="self-center pr-2"
                  style={{ textAlign: "center" }}
                >
                  {playersInBooking.length >= 2 ? (
                    <label
                      onClick={() =>
                        setGuestPlayerToJoin({
                          name: guestPlayerName,
                          email: guestPlayerEmail,
                        })
                      }
                      className="btn-outline btn-sm btn flex justify-between"
                      htmlFor="action-modal-player-remove"
                    >
                      Add
                      <CustomIcon width={25} path={`/svg/add-circle.svg`} />
                    </label>
                  ) : (
                    <div>
                      <CustomIcon path="/svg/crown.svg" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };
};
