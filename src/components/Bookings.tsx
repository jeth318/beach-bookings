import { type User, type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/router";
import { CheckAvailability } from "./CheckAvailability";
import { parseDate, parseTime, today } from "~/utils/time.util";
import { getBgColor } from "~/utils/color.util";
import {
  type EventType,
  bookingsByDate,
  emailDispatcher,
  getProgressAccent,
  isOngoingGame,
} from "~/utils/booking.util";
import {
  getEmailRecipients,
  getUsersByBooking,
  removeBookingText,
} from "~/utils/general.util";
import { ArrogantFrog } from "./ArrogantFrog";
import ActionModal from "./ActionModal";
import { Player } from "./Player";
import { OngoingGame } from "./OngoingGame";
import { CustomIcon } from "./CustomIcon";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Bookings = ({ bookings }: Props) => {
  const session = useSession();
  const router = useRouter();
  const isMainPage = router.asPath === "/";
  const removeBooking = api.booking.delete.useMutation();
  const updateBooking = api.booking.update.useMutation();

  const historyOnly = router.asPath === "/history";
  const createdOnly = router.asPath === "/created";

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

  const { data: users = [], isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();

  const { data: associations = [] } = api.association.getAll.useQuery();
  const { data: facilities = [] } = api.facility.getAll.useQuery();
  const { refetch: refetchBookings } = api.booking.getAll.useQuery();

  const emailerMutation = api.emailer.sendEmail.useMutation();

  const getAssociation = (id: string) => {
    return associations.find((item) => item.id === id);
  };

  const getFacility = (id: string) => {
    return facilities.find((item) => item.id === id);
  };

  const handleMutationSuccess = (
    mutatedBooking: Booking,
    booking: Booking,
    eventType: EventType
  ) => {
    const recipients = getEmailRecipients({
      users,
      booking,
      sessionUserId: sessionUserId || "",
      eventType,
    });

    emailDispatcher({
      recipients,
      bookerName: session.data?.user.name || "A player",
      originalBooking: booking,
      mutatedBooking,
      bookings: bookings || [],
      eventType,
      mutation: emailerMutation,
    });

    void refetchBookings().then(() => {
      setDeleting({ isWorking: false, bookingId: undefined });
      setLeaving({ isWorking: false, bookingId: undefined });
      setIsJoining({ isWorking: false, bookingId: undefined });
    });
  };

  const deleteBooking = (booking: Booking | undefined) => {
    if (!!booking) {
      setDeleting({ isWorking: true, bookingId: booking.id });
      removeBooking.mutate(
        { id: booking.id },
        {
          onSuccess: (mutatedBooking: Booking) => {
            handleMutationSuccess(mutatedBooking, booking, "DELETE");
          },
        }
      );
    }
  };

  const joinGame = (booking: Booking) => {
    if (!sessionUserId) {
      return null;
    }
    setIsJoining({ isWorking: true, bookingId: booking.id });
    const updatedPlayers = [...booking.players, sessionUserId];
    updateBooking.mutate(
      { ...booking, players: updatedPlayers },
      {
        onSuccess: (mutatedBooking: Booking) =>
          handleMutationSuccess(mutatedBooking, booking, "JOIN"),
      }
    );
  };

  const leaveGame = (booking: Booking) => {
    if (!sessionUserId) {
      return null;
    }
    setLeaving({ isWorking: true, bookingId: booking.id });
    const updatedPlayers = booking.players.filter(
      (player) => player !== sessionUserId
    );

    updateBooking.mutate(
      { ...booking, players: updatedPlayers },
      {
        onSuccess: (mutatedBooking: Booking) => {
          handleMutationSuccess(mutatedBooking, booking, "LEAVE");
        },
      }
    );
  };

  const oldBookings = bookings?.filter(
    (booking) => booking.date.getTime() < today
  );

  const bgColorDark = getBgColor(router.asPath);

  const bookingsToShow = bookingsByDate({
    associations,
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
              className="smooth-render-in border-b border-zinc-400 last:border-b-0"
            >
              <div className="card-compact card">
                <div
                  className={`card-body flex-row justify-between text-primary-content`}
                >
                  <div className="flex flex-col">
                    {isOngoingGame(booking) && <OngoingGame />}
                    <div>
                      <h2 className="card-title text-2xl">
                        {parseDate(booking)}
                        {booking.players.length === 4 && !historyOnly && " ✅"}
                      </h2>
                      <div className="">
                        <div className="text-lg">{parseTime(booking)}</div>
                        {/* {booking.associationId && (
                          <div className="flex flex-row items-center">
                            <CustomIcon path="/svg/people.svg" width={20} />
                            <span className="pb-2 pl-2 pt-1">
                              {getAssociation(booking?.associationId)?.name}
                            </span>
                          </div>
                        )} 
                        {booking.facilityId && (
                          <div className="flex flex-row items-center">
                            <CustomIcon
                              path="/svg/location-arrow.svg"
                              width={20}
                            />
                            <Link href="/" passHref>
                              <span className="pb-2 pl-2 pt-1 text-white">
                                {getFacility(booking?.facilityId)?.name}
                              </span>
                            </Link>
                          </div>
                        )}
                        */}
                      </div>
                      <div className="self-start pt-4">
                        {isInitialLoadingUsers ? (
                          <div className="flex justify-start">
                            <BeatLoader size={10} color="#36d7b7" />
                          </div>
                        ) : (
                          getUsersByBooking(users, booking).map(
                            (user: User) => (
                              <Player
                                key={user.id}
                                user={user}
                                booking={booking}
                              />
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`${historyOnly ? "items-center" : ""}`}>
                    <div className="flex flex-col justify-between">
                      <div className="self-start pb-4">
                        <div className="">{booking.duration} minutes</div>
                        <div>Court {booking.court}</div>
                        <div></div>
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
                              onClick={() => joinGame(booking)}
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
