import { type User, type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { CustomIcon } from "./CustomIcon";
import { useRouter } from "next/router";
import { CheckAvailability } from "./CheckAvailability";
import { parseDate, parseTime, today } from "~/utils/time.util";
import { getBgColor } from "~/utils/color.util";
import {
  bookingsByDate,
  emailDispatcher,
  getProgressAccent,
} from "~/utils/booking.util";
import { getEmailRecipients, removeBookingText } from "~/utils/general.util";
import { ArrogantFrog } from "./ArrogantFrog";
import ActionModal from "./ActionModal";

type Bookings = {
  data: Booking[];
};

type Props = {
  bookings?: Booking[];
};

type BookingAction = {
  isWorking: boolean;
  bookingId?: string;
};

const getUsersInBooking = (users: User[], booking: Booking) => {
  return users.filter((user) => booking.players.includes(user.id));
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Bookings = ({ bookings }: Props) => {
  const session = useSession();
  const sessionUserId = session?.data?.user?.id;
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

  const router = useRouter();

  const historyOnly = router.asPath === "/history";
  const createdOnly = router.asPath === "/created";

  const isMainPage = router.asPath === "/";
  const removeBooking = api.booking.delete.useMutation();
  const updateBooking = api.booking.update.useMutation();

  const { data: users = [], isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();

  const { refetch: refetchBookings } = api.booking.getAll.useQuery();
  const emailerMutation = api.emailer.sendEmail.useMutation();

  const deleteBooking = (booking: Booking | undefined) => {
    if (!!booking) {
      const recipients = getEmailRecipients({
        users,
        booking,
        sessionUserId: session.data?.user.id || "",
        eventType: "DELETE",
      });

      console.log("deleteGame recipients:", recipients);

      setDeleting({ isWorking: true, bookingId: booking.id });
      removeBooking.mutate(
        { id: booking.id },
        {
          onSuccess: (mutatedBooking: Booking) => {
            emailDispatcher({
              recipients,
              bookerName: session.data?.user.name || "A player",
              originalBooking: booking,
              mutatedBooking,
              bookings: bookings || [],
              eventType: "DELETE",
              mutation: emailerMutation,
            });
            setTimeout(() => {
              setBookingToDelete(undefined);
              void refetchBookings();
              setDeleting({ isWorking: false, bookingId: undefined });
            }, 1000);
          },
        }
      );
    }
  };

  const joinGame = (booking: Booking, users: User[]) => {
    const recipients = getEmailRecipients({
      users,
      booking,
      sessionUserId: session.data?.user.id || "",
      eventType: "JOIN",
    });

    console.log("joinGame recipients", recipients);

    if (sessionUserId) {
      setIsJoining({ isWorking: true, bookingId: booking.id });
      const updatedPlayers = [...booking.players, sessionUserId];

      updateBooking.mutate(
        { ...booking, players: updatedPlayers },
        {
          onSuccess: (mutatedBooking: Booking) => {
            emailDispatcher({
              recipients,
              playerName: session.data?.user.name || "A player",
              bookings: bookings || [],
              originalBooking: booking,
              mutatedBooking,
              eventType: "JOIN",
              mutation: emailerMutation,
            });
            setTimeout(() => {
              void refetchBookings();
              setIsJoining({ isWorking: false, bookingId: undefined });
            }, 1000);
          },
        }
      );
    }
  };

  const leaveGame = (booking: Booking) => {
    const eventType = "LEAVE";
    const recipients = getEmailRecipients({
      users,
      booking,
      sessionUserId: session.data?.user.id || "",
      eventType,
    });

    console.log("leaveGame recipients:", recipients);

    setLeaving({ isWorking: true, bookingId: booking.id });
    const updatedPlayers = booking.players.filter(
      (player) => player !== sessionUserId
    );

    updateBooking.mutate(
      { ...booking, players: updatedPlayers },
      {
        onSuccess: (mutatedBooking: Booking) => {
          emailDispatcher({
            eventType,
            recipients,
            mutatedBooking,
            bookings: bookings || [],
            originalBooking: booking,
            mutation: emailerMutation,
            playerName: session.data?.user.name || "A player",
          });
          setTimeout(() => {
            void refetchBookings();
            setLeaving({ isWorking: false, bookingId: undefined });
          }, 1000);
        },
      }
    );
  };

  const oldBookings = bookings?.filter(
    (booking) => booking.date.getTime() < today
  );

  const bgColorDark = getBgColor(router.asPath);

  const bookingsToShow = bookingsByDate({
    bookings,
    path: router.asPath,
    sessionUserId,
  });

  const showArrogantFrog =
    (!oldBookings?.length && historyOnly) ||
    (!bookingsToShow?.length && !historyOnly);

  if (showArrogantFrog) {
    return <ArrogantFrog />;
  }

  return (
    <div>
      <ActionModal
        callback={deleteBooking}
        data={bookingToDelete}
        tagRef="delete-booking"
        title="Confirm deletion"
        body={removeBookingText}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      <div className={`bg-gradient-to-b ${bgColorDark} bookings-container`}>
        {bookingsToShow?.map((booking: Booking) => {
          return (
            <div
              key={booking.id}
              className="bookings-wrapper smooth-render-in border-b border-zinc-400"
            >
              <div className=" border-spacing card-compact card">
                <div
                  className={`card-body min-w-min flex-row justify-between text-primary-content`}
                >
                  <div className="container">
                    <div className="flex flex-col justify-between">
                      <div>
                        <h2 className="card-title text-2xl">
                          {parseDate(booking)}
                          {booking.players.length === 4 &&
                            !historyOnly &&
                            " ✅"}
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
                                    style={{ marginTop: "-15" }}
                                    className="smooth-render-in-slower flex flex-row items-center"
                                  >
                                    {user.name}
                                    {booking.userId === user.id ? (
                                      <div className="pl-2">
                                        <CustomIcon
                                          path="/svg/crown.svg"
                                          width={17}
                                        />
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                  </div>
                                );
                              }
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`${historyOnly ? "items-center" : ""}`}>
                    <div className="flex flex-col justify-between">
                      <div className="self-start pb-4">
                        <div className="">{booking.duration} minutes</div>
                        <div>Court {booking.court}</div>
                      </div>
                      {!historyOnly && (
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
                      )}

                      <br />
                      {sessionUserId && !historyOnly ? (
                        <div className="smooth-render-in-slower btn-group btn-group-vertical flex">
                          {booking.players.includes(sessionUserId) && (
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
                          {!booking.players.includes(sessionUserId) && (
                            <button
                              onClick={() => joinGame(booking, users)}
                              className={`${
                                booking.players.length < 4
                                  ? "btn-accent"
                                  : "btn-disabled"
                              } btn-sm btn text-white`}
                            >
                              {joining.isWorking &&
                              booking.id === joining.bookingId ? (
                                <BeatLoader size={10} color="white" />
                              ) : booking.players.length < 4 ? (
                                "Join"
                              ) : (
                                "Full"
                              )}
                            </button>
                          )}
                          {!isMainPage &&
                            session?.data?.user?.id === booking?.userId && (
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
                          {!isMainPage &&
                            sessionUserId === booking?.userId &&
                            !historyOnly && (
                              <label
                                htmlFor="action-modal-delete-booking"
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
                      ) : (
                        <div style={{ height: "32px" }}></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {createdOnly && <CheckAvailability />}
      </div>
    </div>
  );
};
