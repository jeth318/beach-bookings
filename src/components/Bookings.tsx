import { type User, type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";

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
  return `${dayOfTheMonth} ${month} - ${nameOfTheDay} `;
};

const getProgressAccent = (booking: Booking) => {
  switch (booking?.players?.length) {
    case 1:
      return "progress-error";
    case 2:
      return "progress-warning";
    case 3:
      return "progress-warning";
    case 4:
      return "progress-success";
    default:
      return "progress-error";
  }
};

export const Bookings = () => {
  const session = useSession();
  const { data: users = [] } = api.user.getAll.useQuery();
  const removeBooking = api.booking.delete.useMutation();
  const { data: bookings, refetch: refetchBookings } =
    api.booking.getAll.useQuery();
  if (!bookings) {
    return null;
  }

  const deleteBooking = (id: string) => {
    removeBooking.mutate({ id });
    setTimeout(() => {
      void refetchBookings();
    }, 200);
    console.log("Delete");
  };

  const bookingsByDate = bookings.sort(
    (a: Booking, b: Booking) => a.date.getTime() - b.date.getTime()
  );

  return (
    <div>
      {bookingsByDate.map((booking: Booking, index: number) => {
        return (
          <div key={booking.id} className="border border-zinc-400">
            <div className="border-spacing card card-compact">
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
                <progress
                  className={`w-100 progress ${getProgressAccent(booking)}`}
                  value={booking.players.length * 25}
                  max="100"
                ></progress>
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
                  <div className="btn-group btn-group-vertical flex self-end">
                    {session.data?.user.id &&
                      booking.players.includes(session.data?.user.id) && (
                        <button className="btn-secondary btn-sm btn">
                          Leave
                        </button>
                      )}
                    {session.data?.user.id &&
                      !booking.players.includes(session.data?.user.id) && (
                        <button className="btn-primary btn-sm  btn">
                          Join
                        </button>
                      )}
                    {session.data?.user.id === booking?.userId && (
                      <button className="btn-primary btn-sm btn">
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
                      <button
                        onClick={() => deleteBooking(booking.id)}
                        className="btn-warning btn-sm btn"
                      >
                        Delete
                      </button>
                    )}
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
