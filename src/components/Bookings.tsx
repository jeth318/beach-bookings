import { type User, type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import Image from "next/image";

type Bookings = {
  data: Booking[];
};
const today = new Date().getTime();

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednsday",
  "Thursday",
  "Friday",
  "Saturday",
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

type Props = {
  joinedOnly?: boolean;
  createdOnly?: boolean;
  historyOnly?: boolean;
};

type BookingAction = {
  isWorking: boolean;
  bookingId?: string;
};

export const Bookings = ({ joinedOnly, createdOnly, historyOnly }: Props) => {
  const session = useSession();
  const [bookingToDelete, setBookingToDelete] = useState<Booking | undefined>();
  const [joining, setIsJoining] = useState<BookingAction>({
    isWorking: false,
    bookingId: "",
  });
  const [leaving, setLeaving] = useState<BookingAction>({
    isWorking: false,
    bookingId: "",
  });
  const [deleting, setDeleting] = useState<BookingAction>({
    isWorking: false,
    bookingId: "",
  });

  const removeBooking = api.booking.delete.useMutation();
  const updateBooking = api.booking.update.useMutation();
  const { data: users = [], isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();

  const {
    data: bookings,
    refetch: refetchBookings,
    isInitialLoading: isInitialLoadingBookings,
  } = api.booking.getAll.useQuery();

  if (!bookings) {
    return null;
  }

  const deleteBooking = () => {
    if (!!bookingToDelete) {
      setDeleting({ isWorking: true, bookingId: bookingToDelete.id });
      removeBooking.mutate({ id: bookingToDelete.id });
      setTimeout(() => {
        setBookingToDelete(undefined);
        void refetchBookings();
        setDeleting({ isWorking: false, bookingId: undefined });
      }, 1000);
    }
  };

  const joinGame = (booking: Booking) => {
    if (session.data?.user.id) {
      setIsJoining({ isWorking: true, bookingId: booking.id });
      const updatedPlayers = [...booking.players, session.data.user.id];
      updateBooking.mutate({ ...booking, players: updatedPlayers });
      setTimeout(() => {
        void refetchBookings();
        setIsJoining({ isWorking: false, bookingId: undefined });
      }, 1000);
    }
  };

  const leaveGame = (booking: Booking) => {
    setLeaving({ isWorking: true, bookingId: booking.id });
    const updatedPlayers = booking.players.filter(
      (player) => player !== session.data?.user.id
    );

    updateBooking.mutate({ ...booking, players: updatedPlayers });
    setTimeout(() => {
      void refetchBookings();
      setLeaving({ isWorking: false, bookingId: undefined });
    }, 1000);
  };

  const isUserInBooking = (booking: Booking) => {
    return (
      session?.data?.user.id && booking.players.includes(session?.data?.user.id)
    );
  };

  const bookingsByDate = bookings
    .sort((a: Booking, b: Booking) => a.date.getTime() - b.date.getTime())
    .filter((booking) =>
      historyOnly
        ? booking.date.getTime() < today
        : booking.date.getTime() >= today
    )
    .filter((booking) => {
      if (!session?.data?.user.id) {
        return booking.date.getTime() >= today;
      }

      if (joinedOnly) {
        return booking.players.includes(session.data.user.id);
      } else if (createdOnly) {
        return booking.userId === session.data?.user.id;
      } else if (historyOnly) {
        return booking.date.getTime() < today;
      } else {
        return booking.date.getTime() >= today;
      }
    });

  if (!bookingsByDate.length) {
    const frogText = joinedOnly
      ? "Ey, looking quite lonely. You'd better find a game to join 🐸"
      : createdOnly
      ? "You have no active bookings 🐸"
      : historyOnly
      ? "No old bookings were found. Wierd... 🐸"
      : "No bookings found. Either we have to step it up and start playing and adding bookings, or else there is a bug somewhere in the code 🐸";

    return (
      <div className="flex h-screen flex-row items-center self-center">
        <div className="flex flex-col items-center justify-center pb-14">
          <Image
            style={{ borderRadius: "50%" }}
            alt="frog"
            src="/cig-frog.gif"
            width={210}
            height={210}
          />
          <div className="p-4 text-center text-xl text-white">{frogText}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        {/* Put this part before </body> tag */}
        <input type="checkbox" id="action-modal" className="modal-toggle" />
        <div className="modal modal-bottom  sm:modal-middle">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Confirm deletion</h3>
            <p className="py-4">
              If you remove this booking, it will be gone forever. But hey, I am
              not your mommy, you are in charge.
            </p>
            <div className="modal-action">
              <div className="btn-group">
                <label htmlFor="action-modal" className="btn ">
                  Cancel
                </label>
                <label
                  htmlFor="action-modal"
                  className="btn-error btn text-white"
                  onClick={() => {
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
          <div
            key={booking.id}
            className="smooth-render-in border-b border-zinc-400"
          >
            <div className="border-spacing card-compact card">
              <div
                className={`card-body min-w-min flex-row justify-between text-primary-content ${
                  joinedOnly || createdOnly
                    ? "bg-gradient-to-b from-[#007621a6] to-[#062d35d8]"
                    : ""
                }`}
              >
                <div>
                  <div className="container">
                    <div className="flex">
                      <div>
                        <h2 className="card-title text-2xl">
                          {parseDate(booking)}
                          {booking.players.length === 4 && " ✅"}
                        </h2>
                        <div className="text-lg">{parseTime(booking)}</div>
                        <div className="self-start pt-4">
                          {isInitialLoadingUsers ? (
                            <div className="flex justify-start">
                              <BeatLoader size={10} color="#36d7b7" />
                            </div>
                          ) : (
                            getUsersInBooking(users, booking).map(
                              (user: User) => {
                                return (
                                  <div
                                    key={user.id}
                                    className="smooth-render-in"
                                  >
                                    {user.name}{" "}
                                    {booking.userId === user.id ? "👑" : ""}
                                  </div>
                                );
                              }
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-col justify-between">
                    <div className="self-start pb-4">
                      <div className="">{booking.duration} minutes</div>
                      <div>Court {booking.court}</div>
                    </div>
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
                    {session.data?.user.id && !historyOnly && (
                      <div className="btn-group btn-group-vertical flex">
                        {booking.players.includes(session.data.user.id) && (
                          <button
                            onClick={() => leaveGame(booking)}
                            className="btn-warning btn-sm btn text-white"
                          >
                            {leaving.isWorking &&
                            leaving.bookingId === booking.id ? (
                              <BeatLoader size={10} color="white" />
                            ) : (
                              "Leave"
                            )}
                          </button>
                        )}
                        {!booking.players.includes(session.data.user.id) && (
                          <button
                            onClick={() => joinGame(booking)}
                            className={`${
                              booking.players.length < 4
                                ? "btn-success"
                                : "hidden"
                            } btn-sm btn text-white`}
                          >
                            {joining.isWorking &&
                            booking.id === joining.bookingId ? (
                              <BeatLoader size={10} color="white" />
                            ) : (
                              "Join"
                            )}
                          </button>
                        )}
                        {session.data.user.id === booking?.userId && (
                          <button className="btn-sm btn text-white">
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
                        {session.data.user.id === booking?.userId &&
                          !historyOnly && (
                            <label
                              htmlFor="action-modal"
                              onClick={() => void setBookingToDelete(booking)}
                              className="btn-error btn-sm btn text-white"
                            >
                              {deleting.isWorking &&
                              booking.id === deleting.bookingId ? (
                                <BeatLoader size={10} color="white" />
                              ) : (
                                "Delete"
                              )}
                            </label>
                          )}
                      </div>
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
