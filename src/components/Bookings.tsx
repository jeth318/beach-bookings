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
  joinBookingText,
  leaveBookingText,
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
  const [bookingToChange, setBookingToChange] = useState<Booking | undefined>();
  const [bookingToDelete, setBookingToDelete] = useState<Booking | undefined>();
  const [bookingToLeave, setBookingToLeave] = useState<Booking | undefined>();
  const [bookingToJoin, setBookingToJoin] = useState<Booking | undefined>();

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
      {
        ...booking,
        players: updatedPlayers,
        association: booking.associationId,
        facility: booking.facilityId,
      },
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
      {["delete", "leave", "join"].flatMap((action) => {
        let level = "error";
        let body = "";
        let callback;

        switch (action) {
          case "delete":
            level = "error";
            body = removeBookingText;
            callback = deleteBooking;
            break;
          case "leave":
            level = "warning";
            body = leaveBookingText;
            callback = leaveGame;
            break;
          case "join":
            level = "accent";
            body = joinBookingText;
            callback = joinGame;
            break;
          default:
            callback = () => {
              return null;
            };
        }

        return (
          <ActionModal
            callback={callback}
            data={bookingToChange}
            tagRef={`${action}-booking`}
            title={`Confirm ${action}`}
            body={body}
            confirmButtonText={action.charAt(0).toUpperCase() + action.slice(1)}
            cancelButtonText="Cancel"
            level={level}
          />
        );
      })}

      <div className={`bg-gradient-to-b ${bgColorDark} bookings-container`}>
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
                              <Link href="/" passHref>
                                <div className="flex flex-row items-center">
                                  {getFacility(booking?.facilityId)?.name}
                                </div>
                              </Link>
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
                            {renderPartyLeader()}
                            {renderPlayersInBooking()}
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
                            {booking.players.includes(sessionUserId) && (
                              <label
                                htmlFor="action-modal-leave-booking"
                                onClick={() => void setBookingToChange(booking)}
                                className="btn-warning btn-sm btn text-white"
                              >
                                {leaving.isWorking &&
                                booking.id === leaving.bookingId ? (
                                  <BeatLoader size={10} color="white" />
                                ) : (
                                  "Leave"
                                )}
                              </label>
                            )}
                            {!booking.players.includes(sessionUserId) && (
                              <label
                                htmlFor="action-modal-join-booking"
                                onClick={() => void setBookingToChange(booking)}
                                className={`${
                                  !booking.locked && booking.players.length < 4
                                    ? "btn-accent"
                                    : "btn-disabled"
                                } btn-sm btn text-white`}
                              >
                                {joining.isWorking &&
                                booking.id === joining.bookingId ? (
                                  <BeatLoader size={10} color="white" />
                                ) : booking.locked ? (
                                  "Locked"
                                ) : booking.players.length < 4 ? (
                                  "Join"
                                ) : (
                                  "Full"
                                )}
                              </label>
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
                                  onClick={() =>
                                    void setBookingToChange(booking)
                                  }
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
            </div>
          );
        })}
        {createdOnly && <CheckAvailability />}
      </div>
    </div>
  );
};
