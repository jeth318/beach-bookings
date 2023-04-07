import { type User, type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";

type Bookings = {
  data: Booking[];
};
type Props = {
  users: User[];
  bookings: Booking[];
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
  const endHour = endDate.getHours();
  const endMinutes = endDate.getMinutes();
  return `${booking.date?.getHours()}:${booking.date?.getMinutes()}0 - ${endHour}:${endMinutes}`;
};

const getUsersInBooking = (users: User[], booking: Booking) => {
  return users.filter((user) => booking.players.includes(user.id));
};

const parseDate = (booking: Booking) => {
  const nameOfTheDay = days[booking.date.getDay()];
  const dayOfTheMonth = booking.date.getDate();
  const month = months[booking.date.getMonth() + 1];
  return `${dayOfTheMonth} ${month} - ${nameOfTheDay} `;
};

const getProgressAccent = (booking: Booking) => {
  console.log(booking?.players?.length);

  switch (booking?.players?.length) {
    case 1:
      return "error";
    case 2:
      return "warning";
    case 3:
      return "warning";
    case 4:
      return "success";
    default:
      return "error";
  }
};

export const Bookings = ({ bookings, users }: Props) => {
  const session = useSession();
  if (!bookings) {
    return null;
  }

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
                  className={`w-100 progress progress-${getProgressAccent(
                    booking
                  )}`}
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
                      <button className="btn-primary btn-sm btn">Edit</button>
                    )}
                    {session.data?.user.id === booking?.userId && (
                      <button className="btn-warning btn-sm btn">Delete</button>
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
