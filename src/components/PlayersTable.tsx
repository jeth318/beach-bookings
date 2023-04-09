import { type Booking, type User } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "~/utils/api";

type Props = {
  booking: Booking;
};

export const PlayersTable = ({ booking }: Props) => {
  const [playersInBooking, setPlayersInBooking] = useState<User[]>();
  const {
    refetch: refetchBookings,
    isInitialLoading: isInitialLodaingBookings,
    data: bookings,
  } = api.booking.getAll.useQuery();
  const updateBooking = api.booking.update.useMutation();
  const {
    data: users,
    isFetching: isFetchingUsers,
    isInitialLoading: isInitialLodaingUsers,
  } = api.user.getAll.useQuery();
  const [playerToRemove, setPlayerToRemove] = useState<string | undefined>();

  useEffect(() => {
    setPlayersInBooking(
      users?.filter((user) => booking.players.includes(user.id))
    );
  }, [booking, users]);

  const removePlayer = (playerId: string) => {
    void updateBooking.mutate(
      {
        ...booking,
        players: booking.players.filter((id) => id !== playerId),
      },
      {
        onSuccess: () => {
          setPlayersInBooking(
            playersInBooking?.filter((player) => player.id !== playerId)
          );
          void refetchBookings();
        },
      }
    );
  };
  return (
    <div>
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
          <div>
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

      <table className="table-compact collapse table w-full overflow-x-auto">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {!playersInBooking ||
          isInitialLodaingBookings ||
          isInitialLodaingUsers ? (
            <tr>
              <td colSpan={2}>
                <div className="flex justify-center">
                  <BeatLoader size={20} color="#36d7b7" />
                </div>
              </td>
            </tr>
          ) : (
            playersInBooking?.map((player) => {
              return (
                <tr key={player.id}>
                  <td>
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
                        <div className="font-bold">{player.name}</div>
                        <div className="text-sm opacity-50">{player.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <label
                      onClick={() => setPlayerToRemove(player.id)}
                      className={`btn-outline btn-sm btn ${
                        playersInBooking.length < 2 ? "btn-disabled" : ""
                      }`}
                      htmlFor="action-modal-player-remove"
                    >
                      Kick 👋
                    </label>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        {/* foot */}
        <tfoot>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
