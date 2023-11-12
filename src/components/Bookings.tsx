import { type User, type Booking, type Facility } from "@prisma/client";
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
  bookingsByDate,
  emailDispatcher,
  getProgressAccent,
  isOngoingGame,
  type EventType,
} from "~/utils/booking.util";
import {
  getEmailRecipients,
  getUsersByBooking,
  joinBookingText,
  leaveBookingText,
  removeBookingText,
  toastMessages,
} from "~/utils/general.util";
import { ArrogantFrog } from "./ArrogantFrog";
import ActionModal from "./ActionModal";
import { Player } from "./Player";
import { OngoingGame } from "./OngoingGame";
import { CustomIcon } from "./CustomIcon";
import { PlayersTable } from "./PlayersTable";
import { Toast } from "./Toast";

type Bookings = {
  data: Booking[];
  facilities?: Facility[];
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
  const [bookingToChange, setBookingToChange] = useState<Booking | undefined>();

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

  const [toastMessage, setToastMessage] = useState<string>();

  const { data: users = [], isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();

  const { data: associations = [] } = api.association.getAll.useQuery();
  const { data: user } = api.user.get.useQuery();
  const { data: facilities = [] } = api.facility.getAll.useQuery();
  const { refetch: refetchBookings } = api.booking.getAll.useQuery(undefined, {
    refetchIntervalInBackground: true,
    refetchInterval: 15000,
  });

  const emailerMutation = api.emailer.sendEmail.useMutation();

  const getAssociation = (id: string) => {
    return associations.find((item) => item.id === id);
  };

  const getFacility = (id: string | null) => {
    return facilities.find((item) => item.id === id);
  };

  const handleMutationSuccess = (
    mutatedBooking: Booking,
    booking: Booking,
    eventType: EventType
  ) => {
    const recipients = getEmailRecipients({
      users,
      playersInBooking: booking.players,
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

    toastMessages[eventType] && renderToast(toastMessages[eventType]);
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

  const getJoinButtonText = (booking: Booking) => {
    const spotsAvailable =
      !booking?.maxPlayers ||
      (typeof booking?.maxPlayers === "number" &&
        booking?.maxPlayers > booking.players.length);

    return spotsAvailable
      ? !booking?.joinable && booking.userId !== sessionUserId
        ? "Locked"
        : "Join"
      : "Full";
  };

  const getJoinButtonClassName = (booking: Booking) => {
    const spotsAvailable =
      !booking?.maxPlayers ||
      (typeof booking?.maxPlayers === "number" &&
        booking?.maxPlayers > booking.players.length);

    const btnVariant = spotsAvailable
      ? !booking?.joinable && booking.userId !== sessionUserId
        ? "btn-disabled"
        : "btn-accent"
      : "btn-disabled";

    return `btn-sm btn text-white ${btnVariant}`;
  };

  const joinGame = (booking: Booking) => {
    if (!sessionUserId) {
      return null;
    }

    setIsJoining({ isWorking: true, bookingId: booking.id });
    const updatedPlayers = [...booking.players, sessionUserId];
    updateBooking.mutate(
      {
        ...booking,
        players: updatedPlayers,
        association: booking.associationId,
        facility: booking.facilityId,
      },
      {
        onSuccess: (mutatedBooking: Booking) => {
          handleMutationSuccess(mutatedBooking, booking, "JOIN");
        },
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
      {
        ...booking,
        players: updatedPlayers,
        association: booking.associationId,
        facility: booking.facilityId,
      },
      {
        onSuccess: (mutatedBooking: Booking) => {
          handleMutationSuccess(mutatedBooking, booking, "LEAVE");
        },
      }
    );
  };

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
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
    return (
      <div>
        <ArrogantFrog />
      </div>
    );
  }

  return (
    <div>
      {["delete", "leave", "join"].flatMap((action) => {
        let level = "error";
        let body = "";
        let callback;
        let emoji = "";

        switch (action) {
          case "delete":
            level = "error";
            body = removeBookingText;
            emoji = "☠️";
            callback = deleteBooking;

            break;
          case "leave":
            level = "warning";
            body = leaveBookingText;
            emoji = "🚪";
            callback = leaveGame;
            break;
          case "join":
            level = "accent";
            body = joinBookingText;
            emoji = "🫂";
            callback = joinGame;
            break;
          default:
            callback = () => {
              return null;
            };
        }

        let title = `Confirm ${action} ${emoji}`;

        let confirmButtonText =
          action.charAt(0).toUpperCase() + action.slice(1);

        if (!user?.name || user.name.length < 3) {
          callback = async () => {
            await router.push("/settings");
          };
          title = "What is your name?";
          confirmButtonText = "Settings";
          level = "info";
          body = `Please go to settings and enter your name in order to ${action} this booking.`;
        }

        return (
          <ActionModal
            callback={callback}
            data={bookingToChange}
            tagRef={`${action}-booking`}
            title={title}
            body={body}
            confirmButtonText={confirmButtonText}
            cancelButtonText="Cancel"
            level={level}
          />
        );
      })}

      <div className={`bg-gradient-to-b ${bgColorDark} bookings-container`}>
        {toastMessage && <Toast body={toastMessage} />}

        {bookingsToShow?.map((booking: Booking) => {
          const maxPlayers = booking.maxPlayers || 0;

          const renderPlayersInBooking = () =>
            getUsersByBooking(users, booking)
              .filter((player) => player.id !== booking.userId)
              .map((user: User) => (
                <Player key={user.id} user={user} booking={booking} />
              ));

          const renderPartyLeader = () => {
            const booker = getUsersByBooking(users, booking).find(
              (user) => user.id === booking.userId
            );

            if (booker) {
              return <Player key={booker.id} user={booker} booking={booking} />;
            }
          };

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
                      <h2 className="font-bil card-title text-2xl font-bold">
                        {parseDate(booking)}
                        {booking.players.length === 4 && !historyOnly && " ✅"}
                      </h2>
                      <div className="flex flex-col pb-1 font-medium">
                        <div className="flex flex-row self-start pb-2">
                          <CustomIcon path="/svg/duration.svg" width={20} />
                          <div className="pl-1 text-lg">
                            {parseTime(booking)}
                          </div>
                        </div>

                        <div
                          style={{ maxWidth: "150px" }}
                          className="self-start rounded-lg border border-slate-600 bg-gray-800 p-1"
                        >
                          {booking.associationId && (
                            <div className="flex flex-row items-center self-start pb-1 ">
                              <CustomIcon path="/svg/people.svg" width={18} />
                              <div
                                style={{ maxWidth: 150 }}
                                className="overflow-dots"
                              >
                                {getAssociation(booking?.associationId)?.name}
                              </div>
                            </div>
                          )}
                          {booking.facilityId && (
                            <div className="flex flex-row items-center justify-start">
                              <span className="pr-1">
                                <CustomIcon
                                  path="/svg/location-arrow.svg"
                                  width={20}
                                />
                              </span>
                              <div>
                                <div className="flex flex-row items-center">
                                  {getFacility(booking?.facilityId)?.name}
                                </div>
                              </div>
                              {!!getFacility(booking?.facilityId)?.durations
                                .length && (
                                <span className="pl-2">
                                  <CustomIcon
                                    alt="Game has costs"
                                    path="/svg/coins.svg"
                                    width={18}
                                  />
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div></div>
                      </div>
                      <div className="self-start pt-2">
                        {isInitialLoadingUsers ? (
                          <div className="flex justify-start">
                            <BeatLoader size={10} color="#36d7b7" />
                          </div>
                        ) : (
                          <>
                            {!router.query.id && (
                              <div>
                                {renderPartyLeader()}
                                {renderPlayersInBooking()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`${historyOnly ? "items-center" : "flex"}`}>
                    <div className="flex flex-col self-end pb-2">
                      {!!booking.duration && (
                        <div className="self-center">
                          {booking.duration} min
                        </div>
                      )}
                      {booking.court && (
                        <div className="self-center">Court {booking.court}</div>
                      )}
                      <div
                        style={{ marginTop: "1.5rem" }}
                        className="flex flex-col self-center"
                      >
                        {!historyOnly && (
                          <div
                            className={`radial-progress self-center text-lg font-bold ${getProgressAccent(
                              booking
                            )}`}
                            style={{
                              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                              // @ts-ignore
                              "--value":
                                (!maxPlayers
                                  ? 100
                                  : booking.players.length / maxPlayers) * 100,
                              "--thickness": "3px",
                            }}
                          >
                            {booking.maxPlayers
                              ? `${booking.players.length} / ${booking.maxPlayers}`
                              : booking.players.length}
                          </div>
                        )}

                        {sessionUserId && !historyOnly ? (
                          <div
                            style={{ width: "auto" }}
                            className="smooth-render-in-slower btn-group btn-group-vertical flex pt-14"
                          >
                            {booking.players.includes(sessionUserId) &&
                              !isOngoingGame(booking) && (
                                <label
                                  htmlFor="action-modal-leave-booking"
                                  onClick={() =>
                                    void setBookingToChange(booking)
                                  }
                                  className="btn btn-warning btn-sm text-white"
                                >
                                  {leaving.isWorking &&
                                  booking.id === leaving.bookingId ? (
                                    <BeatLoader size={10} color="white" />
                                  ) : (
                                    "Leave"
                                  )}
                                </label>
                              )}
                            {!booking.players.includes(sessionUserId) &&
                              !isOngoingGame(booking) && (
                                <label
                                  htmlFor="action-modal-join-booking"
                                  onClick={() =>
                                    void setBookingToChange(booking)
                                  }
                                  className={getJoinButtonClassName(booking)}
                                >
                                  {joining.isWorking &&
                                  booking.id === joining.bookingId ? (
                                    <BeatLoader size={10} color="white" />
                                  ) : (
                                    getJoinButtonText(booking)
                                  )}
                                </label>
                              )}

                            {!isMainPage &&
                              session?.data?.user?.id === booking?.userId && (
                                <button className="btn btn-sm text-white">
                                  <Link
                                    href={{
                                      pathname: `/booking/${booking.id}`,
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
                                  onClick={() =>
                                    void setBookingToChange(booking)
                                  }
                                  className="btn btn-error btn-sm text-white"
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
                {router.query.id && (
                  <div className="max-w-lg p-2">
                    <PlayersTable booking={booking} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {createdOnly && <CheckAvailability />}
      </div>
    </div>
  );
};
