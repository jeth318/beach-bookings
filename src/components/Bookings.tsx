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
      {bookingsByDate.map((booking) => {
        return (
          <div key={booking.id}>
            <div className="card">
              <div className="bg-gray card-body min-w-min text-primary-content">
                <div className="flex items-center justify-between">
                  <div className="container">
                    <div className="flex justify-between">
                      <div>
                        <h2 className="card-title">
                          {booking.date?.toDateString()}
                        </h2>
                        <div>{parseTime(booking)}</div>
                      </div>
                      <div>
                        <div>{booking.duration} minutes</div>
                        <div>Court {booking.court}</div>
                      </div>
                    </div>
                  </div>
                  {/*<div
                    className="radial-progress"
                    style={{ "--value": 100, "--size": "3rem" }}
                  >
                    90
        </div>*/}
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
                        <div key={user.id}>
                          {user.name} {booking.userId === user.id ? "👑" : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="card-actions justify-end">
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
                      <button className="btn-error btn-sm btn">Delete</button>
                    )}
                    {!session.data?.user.id && booking.players.length < 4 && (
                      <button className="text-grey btn-sm btn">Join 🔐</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="divider before:bg-slate-700 after:bg-slate-700" />
          </div>
        );
      })}
    </div>
  );
  /*return (
    <>
      <div className="card">
        <div className="bg-gray card-body min-w-min text-primary-content">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Tuesday, April 19</h2>
              <p>19:30 - 21:00</p>
              <p>Court 4</p>
            </div>
            <div
              className="radial-progress"
              style={{ "--value": 100, "--size": "3rem" }}
            >
              90
            </div>
          </div>
          <progress
            className="w-100 progress progress-warning"
            value="75"
            max="100"
          ></progress>
          <div className="flex items-center justify-between">
            <div>
              <div>Niklas Höglund 👑</div>
              <div>Magnus Rudström</div>
              <div>Jesper Thörnberg</div>
            </div>
            <div className="card-actions justify-end">
              <button className="btn-primary btn">Join</button>
            </div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="card">
        <div className="bg-gray card-body min-w-min text-primary-content">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Tuesday, April 24</h2>
              <p>19:30 - 21:00</p>
              <p>Court 4</p>
            </div>
            <div
              className="radial-progress"
              style={{ "--value": 100, "--size": "3rem" }}
            >
              90
            </div>
          </div>
          <progress
            className="w-100 progress progress-accent"
            value="100"
            max="100"
          ></progress>
          <div className="flex items-center justify-between">
            <div>
              <div>Niklas Höglund 👑</div>
              <div>Magnus Rudström</div>
              <div>Jesper Thörnberg</div>
              <div>John Doe</div>
            </div>
            <div className="card-actions justify-end">
              <button className="btn-secondary btn">Leave</button>
            </div>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="card">
        <div className="bg-gray card-body min-w-min text-primary-content">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="card-title">Tuesday, April 19</h2>
              <p>15:00 - 16:00</p>
              <p>Court 6</p>
            </div>
            <div
              className="radial-progress"
              style={{ "--value": 75, "--size": "3rem" }}
            >
              60
            </div>
          </div>
          <progress
            className="w-100 progress progress-error"
            value="25"
            max="100"
          ></progress>
          <div className="flex items-center justify-between">
            <div>
              <div>Niklas Höglund 👑</div>
            </div>
            <div className="card-actions justify-end">
              <button className="btn-primary btn">Join</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );*/
};
