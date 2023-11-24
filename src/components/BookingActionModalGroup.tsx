import { type Booking } from "@prisma/client";
import ActionModal from "./ActionModal";
import {
  joinBookingText,
  leaveBookingText,
  removeBookingText,
} from "~/utils/general.util";
import { useState } from "react";
import useSessionUser from "~/hooks/useSessionUser";
import useUser from "~/hooks/useUser";

type Props = {
  bookingToChange?: Booking;
  joinGame: (booking: Booking) => null | undefined;
  leaveGame: (booking: Booking) => null | undefined;
  deleteBooking: (booking: Booking) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const BookingActionModalGroup = ({
  bookingToChange,
  joinGame,
  leaveGame,
  deleteBooking,
}: Props) => {
  const router = useState();
  const { sessionUser } = useSessionUser();
  const { user } = useUser({ email: sessionUser?.email });

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

        if (!user?.name || user?.name?.length < 3) {
          callback = () => {
            router.push("/settings");
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
    </div>
  );
};
