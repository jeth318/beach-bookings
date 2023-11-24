import { type Booking, type Facility } from "@prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { api } from "~/utils/api";
import { useState } from "react";
import { useRouter } from "next/router";
import { CheckAvailability } from "./CheckAvailability";
import { parseDate, parseTime } from "~/utils/time.util";
import { getBgColor } from "~/utils/color.util";
import {
  bookingsByDate,
  emailDispatcher,
  isOngoingGame,
  type EventType,
  type BookingAction,
} from "~/utils/booking.util";
import {
  getEmailRecipients,
  joinBookingText,
  leaveBookingText,
  removeBookingText,
  renderToast,
  toastMessages,
} from "~/utils/general.util";
import { ArrogantFrog } from "./ArrogantFrog";
import ActionModal from "./ActionModal";
import { OngoingGame } from "./OngoingGame";
import { CustomIcon } from "./CustomIcon";
import { Toast } from "./Toast";
import useEmail from "~/hooks/useEmail";
import useUser from "~/hooks/useUser";
import useBooking from "~/hooks/useBooking";
import useAssociations from "~/hooks/useUserAssociations";
import useSessionUser from "~/hooks/useSessionUser";
import { AssociationSection } from "./AssociationSection";
import { FacilitySection } from "./FacilitySection";
import { PlayerSection } from "./PlayerSection";
import { DurationAndCourtSection } from "./DurationAndCourtSection";
import { ActionPanelSection } from "./ActionPanelSection";

type Bookings = {
  data: Booking[];
  facilities?: Facility[];
};

type Props = {
  bookings?: Booking[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Bookings = ({ bookings }: Props) => {
  const session = useSession();
  const router = useRouter();
  const sessionUserEmail = session.data?.user.email || "";
  const sessionUserId = session?.data?.user?.id;
  const removeBooking = api.booking.delete.useMutation();
  const updateBooking = api.booking.update.useMutation();

  const historyOnly = router.asPath === "/history";
  const createdOnly = router.asPath === "/created";

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

  const { sessionUser } = useSessionUser();
  const { user } = useUser({ email: sessionUserEmail });

  const {
    joinedAssociations: associations,
    isInitialLoadingJoinedAssociations,
  } = useAssociations({
    associationIds: user?.associations,
  });

  const { data: facilities = [] } = api.facility.getAll.useQuery();

  const { refetchBookings } = useBooking();

  const { sendEmail } = useEmail();

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
      sendEmail,
    });

    void refetchBookings().then(() => {
      setDeleting({ isWorking: false, bookingId: undefined });
      setLeaving({ isWorking: false, bookingId: undefined });
      setIsJoining({ isWorking: false, bookingId: undefined });
    });

    toastMessages[eventType] &&
      renderToast(toastMessages[eventType], setToastMessage);
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

  const bgColorDark = getBgColor(router.asPath);

  const bookingsToShow = bookingsByDate({
    associations: associations || [],
    user: sessionUser,
    bookings,
    path: router.asPath,
    sessionUserId,
  });

  const showArrogantFrog = !bookingsToShow?.length && !historyOnly;

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
            level = "success";
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
      <div
        className={`bg-gradient-to-b ${bgColorDark} bookings-container h-full`}
      >
        {toastMessage && <Toast body={toastMessage} />}
        {bookingsToShow?.map((booking: Booking) => {
          const maxPlayers = booking.maxPlayers || 0;

          return (
            <div
              key={booking.id}
              className="smooth-render-in first:border-b-1 border-b border-zinc-400"
            >
              <div className="card-compact card">
                <div
                  className={`card-body flex-row justify-between text-primary-content`}
                >
                  <div className="flex flex-col">
                    {isOngoingGame(booking) && <OngoingGame />}
                    <div>
                      {(sessionUserId &&
                        booking.players.includes(sessionUserId)) ||
                      booking.userId === sessionUserId ? (
                        <Link
                          //href={`/booking/details/${booking.id}`}
                          href="#"
                          className="font-bil card-title text-2xl font-bold"
                        >
                          {parseDate(booking)}
                          {booking.players.length === 4 &&
                            !historyOnly &&
                            " ✅"}
                        </Link>
                      ) : (
                        <div className="font-bil card-title text-2xl font-bold">
                          {parseDate(booking)}
                          {booking.players.length === 4 &&
                            !historyOnly &&
                            " ✅"}
                        </div>
                      )}
                      <div className="flex flex-col pb-1 font-medium">
                        <div className="flex flex-row self-start pb-2">
                          <CustomIcon path="/svg/duration.svg" width={20} />
                          <div className="pl-1 text-lg">
                            {parseTime(booking)}
                          </div>
                        </div>

                        <div
                          style={{ maxWidth: "150px" }}
                          className="transparent-background-grey self-start rounded-lg border border-slate-600 p-1"
                        >
                          {booking.associationId &&
                            sessionUser?.associations.includes(
                              booking.associationId
                            ) && (
                              <AssociationSection
                                booking={booking}
                                isLoading={isInitialLoadingJoinedAssociations}
                                associations={associations}
                              />
                            )}
                          {booking.facilityId && (
                            <FacilitySection
                              facilities={facilities}
                              booking={booking}
                            />
                          )}
                        </div>
                      </div>
                      {sessionUser?.id && <PlayerSection booking={booking} />}
                    </div>
                  </div>
                  <div className={`${historyOnly ? "items-center" : "flex"}`}>
                    <div className="flex flex-col self-end pb-2">
                      <DurationAndCourtSection booking={booking} />
                      <ActionPanelSection
                        isMainPage={router.asPath !== "/"}
                        leaving={leaving}
                        joining={joining}
                        deleting={deleting}
                        booking={booking}
                        sessionUserId={sessionUserId}
                        onBookingChange={setBookingToChange}
                      />
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
