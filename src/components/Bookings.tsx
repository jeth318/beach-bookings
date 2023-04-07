import { type User, type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";

type Bookings = {
  data: Booking[];
};
type Props = {
  users: User[];
  bookings: Booking[];
};

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

const getProgressAccent = (booking: Booking) => {
  switch (booking?.players?.length) {
    case 1:
      return "error";
    case 2:
      return "warning";
    case 3:
      return "warning";
    case 4:
      return "accent";
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
          <div key={booking.id}>
            <div className="card card-compact">
              <div className="bg-gray card-body min-w-min text-primary-content">
                <div className="flex items-center justify-between">
                  <div className="container">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="card-title">
                          {booking.date?.toDateString()}
                        </h2>
                        <div className="text-lg">{parseTime(booking)}</div>
                      </div>
                      <div>
                        <div className="text-lg">
                          {booking.duration} minutes
                        </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    {getUsersInBooking(users, booking).map((user: User) => {
                      return (
                        <div key={user.id} className="text-lg">
                          {user.name} {booking.userId === user.id ? "👑" : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="card-actions flex justify-end">
                    {session.data?.user.id &&
                      booking.players.includes(session.data?.user.id) && (
                        <button className="btn-secondary btn-sm btn">
                          Leave
                        </button>
                      )}
                    {session.data?.user.id &&
                      !booking.players.includes(session.data?.user.id) && (
                        <button className="btn-primary btn-sm btn">Join</button>
                      )}
                    {session.data?.user.id === booking?.userId && (
                      <button className="btn-warning btn-sm btn">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {index < bookings.length - 1 && (
              <div className="divider opacity-50 before:bg-white after:bg-white" />
            )}
          </div>
        );
      })}
    </div>
  );
};
