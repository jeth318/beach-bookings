import { type Booking, type Facility } from "@prisma/client";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useState } from "react";
import { useRouter } from "next/router";
import { CheckAvailability } from "./CheckAvailability";
import { getBgColor } from "~/utils/color.util";
import {
  bookingsByDate,
  emailDispatcher,
  type EventType,
  type BookingAction,
} from "~/utils/booking.util";
import {
  getEmailRecipients,
  renderToast,
  toastMessages,
} from "~/utils/general.util";
import { ArrogantFrog } from "./ArrogantFrog";
import { Toast } from "./Toast";
import useEmail from "~/hooks/useEmail";
import useUser from "~/hooks/useUser";
import useBooking from "~/hooks/useBooking";
import useAssociations from "~/hooks/useUserAssociations";
import useSessionUser from "~/hooks/useSessionUser";
import { BookingItem } from "./BookingItem";
import { BookingActionModalGroup } from "./BookingActionModalGroup";
import useGuest from "~/hooks/useGuest";

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

  const { data: users = [] } = api.user.getAll.useQuery();

  const { sessionUser } = useSessionUser();
  const { user } = useUser({ email: sessionUserEmail });

  const { joinedAssociations: associations } = useAssociations({
    associationIds: user?.associations,
  });

  const { allGuests } = useGuest({});

  const { refetchBookings } = useBooking();

  const { data: facilities } = api.facility.getAll.useQuery();

  const { sendEmail } = useEmail();

  const handleMutationSuccess = (
    mutatedBooking: Booking,
    booking: Booking,
    eventType: EventType
  ) => {
    const recipients = getEmailRecipients({
      users: users || [],
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
      associationId: booking.associationId || null,
      guests: allGuests?.filter((guest) => guest.bookingId === booking.id),
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
      <BookingActionModalGroup
        bookingToChange={bookingToChange}
        joinGame={joinGame}
        leaveGame={leaveGame}
        deleteBooking={deleteBooking}
      />
      <div
        className={`bg-gradient-to-b ${bgColorDark} bookings-container h-full`}
      >
        {toastMessage && <Toast body={toastMessage} />}
        {bookingsToShow?.map((booking: Booking) => {
          return (
            <BookingItem
              key={booking.id}
              booking={booking}
              sessionUser={sessionUser}
              joining={joining}
              leaving={leaving}
              deleting={deleting}
              router={router}
              associations={associations || []}
              facilities={facilities || []}
              onBookingItemChange={setBookingToChange}
            />
          );
        })}
        {createdOnly && <CheckAvailability />}
      </div>
    </div>
  );
};
