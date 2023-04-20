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

type Props = {
  booking: Booking;
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

    void updateBooking.mutate(
      {
        ...booking,
        players: booking.players.filter((id) => id !== playerId),
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

  return (
    <div>
      {toastMessage && <Toast body={toastMessage} />}
      <input
        type="checkbox"
        id="action-modal-player-remove"
        className="modal-toggle"
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Confirm kick 🦵👋</h3>
          <p className="py-4">
            If you remove this player from this booking, he or she will have to
            re-join them selfes.
          </p>
          <div className="modal-action">
            <div className="btn-group">
              <label
                htmlFor="action-modal-player-remove"
                className="btn text-white"
              >
                Cancel
              </label>
              <label
                htmlFor="action-modal-player-remove"
                className="btn-error btn text-white"
                onClick={() => {
                  !!playerToRemove && removePlayer(playerToRemove);
                }}
              >
                Remove player
              </label>
            </div>
          </div>
        </div>
      </div>

      {!playersInBooking ||
      isInitialLodaingBookings ||
      isInitialLodaingUsers ? (
        <div className="flex justify-center">
          <BeatLoader size={20} color="#36d7b7" />
        </div>
      ) : (
        playersInBooking?.map((player) => {
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
              <div className="self-center pr-2" style={{ textAlign: "center" }}>
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
        })
      )}
    </div>
  );
};
