import { type User, type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import { useState } from "react";

type Bookings = {
  data: Booking[];
};

const days = [
  "Monday",
  "Tuesday",
  "Wednsday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const parseTime = (booking: Booking) => {
  const endDate = new Date(
    booking.date.getTime() + booking.duration * 60 * 1000
  );

  const endHour =
    endDate.getHours().toString().length === 1
      ? `0${endDate.getHours()}`
      : endDate.getHours();

  const endMinutes =
    endDate.getMinutes().toString().length === 1
      ? `0${endDate.getMinutes()}`
      : endDate.getMinutes();

  const startHours =
    booking.date.getHours().toString().length > 1
      ? booking.date.getHours()
      : `0${booking.date.getHours()}`;

  const startMinutes =
    booking.date.getMinutes().toString().length > 1
      ? booking.date.getMinutes()
      : `0${booking.date.getMinutes()}`;
  return `${startHours}:${startMinutes} - ${endHour}:${endMinutes}`;
};

const getUsersInBooking = (users: User[], booking: Booking) => {
  return users.filter((user) => booking.players.includes(user.id));
};

const parseDate = (booking: Booking) => {
  const nameOfTheDay = days[booking.date.getDay()];
  const dayOfTheMonth = booking.date.getDate();
  const month = months[booking.date.getMonth()];
  const str = `${dayOfTheMonth} ${month || ""} - ${nameOfTheDay || ""} `;
  return str;
};

const getProgressAccent = (booking: Booking) => {
  switch (booking?.players?.length) {
    case 1:
      return "text-error";
    case 2:
      return "text-warning";
    case 3:
      return "text-warning";
    case 4:
      return "text-success";
    default:
      return "text-error";
  }
};

export const Bookings = () => {
  const session = useSession();
  const [bookingToDelete, setBookingToDelete] = useState<Booking | undefined>();

  const { data: users = [] } = api.user.getAll.useQuery();
  const removeBooking = api.booking.delete.useMutation();
  const updateBooking = api.booking.update.useMutation();
  const { data: bookings, refetch: refetchBookings } =
    api.booking.getAll.useQuery();
  if (!bookings) {
    return null;
  }

  const deleteBooking = () => {
    console.log({ bookingToDelete });

    if (!!bookingToDelete) {
      removeBooking.mutate({ id: bookingToDelete.id });
      setTimeout(() => {
        setBookingToDelete(undefined);
        void refetchBookings();
      }, 1000);
    }
  };

  const joinGame = (booking: Booking) => {
    if (session.data?.user.id) {
      const updatedPlayers = [...booking.players, session.data.user.id];
      updateBooking.mutate({ ...booking, players: updatedPlayers });
      setTimeout(() => {
        void refetchBookings();
      }, 1000);
    }
  };

  const leaveGame = (booking: Booking) => {
    const updatedPlayers = booking.players.filter(
      (player) => player !== session.data?.user.id
    );

    updateBooking.mutate({ ...booking, players: updatedPlayers });
    setTimeout(() => {
      void refetchBookings();
    }, 1000);
  };

  const bookingsByDate = bookings.sort(
    (a: Booking, b: Booking) => a.date.getTime() - b.date.getTime()
  );

  return (
    <div>
      <div>
        {/* Put this part before </body> tag */}
        <input type="checkbox" id="action-modal" className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Confirm deletion</h3>
            <p className="py-4">
              If you remove this booking, it will be gone forever. But hey, I am
              not your mommy, you are incharge.
            </p>
            <div className="modal-action">
              <div className="btn-group">
                <label htmlFor="action-modal" className="btn text-white">
                  Cancel
                </label>
                <label
                  htmlFor="action-modal"
                  className="btn-error btn text-white"
                  onClick={() => {
                    console.log({ bookingToDelete });
                    deleteBooking();
                  }}
                >
                  Delete
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {bookingsByDate.map((booking: Booking) => {
        return (
          <div key={booking.id} className="border-b border-zinc-400">
            <div className="border-spacing card-compact card">
              <div className="bg-gray card-body min-w-min text-primary-content">
                <div className="flex items-center justify-between">
                  <div className="container">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="card-title">
                          {parseDate(booking)}
                          {booking.players.length === 4 && " ✅"}
                        </h2>
                        <div className="text-base">{parseTime(booking)}</div>
                      </div>
                      <div>
                        <div className="">{booking.duration} minutes</div>
                        <div>Court {booking.court}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div>
                    {getUsersInBooking(users, booking).map((user: User) => {
                      return (
                        <div key={user.id}>
                          {user.name} {booking.userId === user.id ? "👑" : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col">
                    <div
                      className={`radial-progress self-end text-lg font-bold ${getProgressAccent(
                        booking
                      )}`}
                      style={{
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        "--value": booking.players.length * 25,
                        "--thickness": "3px",
                      }}
                    >
                      {booking.players.length}/4
                    </div>
                    <br />
                    <div className="btn-group btn-group flex self-end">
                      {session.data?.user.id &&
                        booking.players.includes(session.data?.user.id) && (
                          <button
                            onClick={() => leaveGame(booking)}
                            className="btn-sm btn btn"
                          >
                            Leave
                          </button>
                        )}
                      {session.data?.user.id &&
                        !booking.players.includes(session.data?.user.id) && (
                          <button
                            onClick={() => joinGame(booking)}
                            className="btn-sm btn  btn"
                          >
                            Join
                          </button>
                        )}
                      {session.data?.user.id === booking?.userId && (
                        <button className="btn-sm btn btn">
                          <Link
                            href={{
                              pathname: "/booking",
                              query: { booking: booking.id },
                            }}
                          >
                            Edit
                          </Link>
                        </button>
                      )}
                      {session.data?.user.id === booking?.userId && (
                        <label
                          htmlFor="action-modal"
                          onClick={() => void setBookingToDelete(booking)}
                          className="btn-error btn-sm btn text-white"
                        >
                          Delete
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
