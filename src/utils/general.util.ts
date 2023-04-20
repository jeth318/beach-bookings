import { type User, type Booking } from "@prisma/client";
import { type EventType, getTimeWithZeroPadding } from "./booking.util";
import { array } from "zod";

type EmailRecipientsProps = {
  sessionUserId: string;
  eventType: EventType;
  booking: Booking;
  users: User[];
};

type MailOptions = {
  sender?: string;
  recipients: string[];
};

export const getUsersInBooking = (users: User[], booking: Booking) => {
  return users.filter((user) => booking.players.includes(user.id));
};

export const getMailOptions = ({ sender, recipients }: MailOptions) => {
  return {
    from: sender || "",
    to: recipients,
  };
};

export const getEmailRecipients = ({
  users,
  booking,
  sessionUserId,
  eventType,
}: EmailRecipientsProps) => {
  if (eventType === "ADD") {
    return users
      .filter((user) => user.id !== sessionUserId)
      .filter((user) => user.emailConsents.includes("ADD"))
      .map((user) => user.email)
      .filter((email) => !!email) as string[];
  }

  console.log(users);
  console.log(eventType);

  return users
    .filter((user) => booking.players.includes(user.id))
    .filter((user) => !!user.email)
    .filter((user) => user?.emailConsents?.includes(eventType))
    .filter((user) => user.id !== sessionUserId)
    .map((user) => user.email) as string[];
};

export const getEmailTitle = (eventType: EventType) => {
  switch (eventType) {
    case "ADD":
      return "New booking added 🟢";
    case "MODIFY":
      return "Booking changed 🟠";
    case "DELETE":
      return "Booking removed 🔴";
    case "JOIN":
      return "A player joined the party! 🎉";
    case "KICK":
    case "LEAVE":
      return "A player left the party! 😿";
    default:
      return "Got some updates for you ℹ️";
  }
};

export const getPreheader = (eventType: EventType) => {
  switch (eventType) {
    case "ADD":
    case "JOIN":
      return "Great news 🥳";
    case "MODIFY":
      return "Got some news";
    case "DELETE":
    case "LEAVE":
      return "Sad news 😿";
    default:
      return "Yo beach player!";
  }
};

type EmailIngressProps = {
  bookerName?: string | "";
  playerName?: string | "A player";
  eventType: EventType;
};

export const getPrettyDate = (booking: Booking) =>
  booking.date.toLocaleDateString("sv-SE");
export const getPrettyTime = (booking: Booking) =>
  getTimeWithZeroPadding(booking.date.getHours(), booking.date.getMinutes());

export const getEmailIngress = ({
  eventType,
  playerName,
  bookerName,
}: EmailIngressProps) => {
  switch (eventType) {
    case "ADD":
      return `${
        bookerName || "A player"
      } added a brand new booking. Let's get a full squad!`;
    case "MODIFY":
      return `${
        bookerName || "A player"
      } updated a booking you are in</strong>.`;
    case "DELETE":
      return `${
        bookerName || "The booker"
      } just removed a booking where you were signed up. Sad story!`;
    case "JOIN":
      return `${
        playerName || "A player"
      } joined your party and looks eager to play.`;
    case "LEAVE":
      return `${
        playerName || "A player"
      } left your party. It's time to find a replacement if you haven't already!`;
    case "KICK":
      return `${
        playerName || "A player"
      } was kindly and respectully kicked from your party by the booking owner. No questions asked, we are still friends.`;
    default:
      return "Yo beach player!";
  }
};

export const getEmailHeading = (eventType: string) => {
  switch (eventType) {
    case "ADD":
      return `An oppertunity to play!`;
    case "MODIFY":
      return "Sometimes stuff changes.";
    case "DELETE":
      return `Game over`;
    case "JOIN":
      return `Reinforcements incoming!`;
    case "LEAVE":
    case "KICK":
      return `We lost a pro.`;
    default:
      return "Yo beach player.";
  }
};

export const getFrogText = (path: string) => {
  const history = path === "/history";
  const joined = path === "/joined";
  const created = path === "/created";

  if (joined) {
    return "Ey, this is looking quite lonely.";
  }

  if (created) {
    return "You have no active bookings 🐸";
  }

  if (history) {
    return "No old bookings yet...";
  }

  return "No bookings found. Either we have to step it up and start playing and adding bookings, or else there is a bug somewhere in the code 🐸";
};

export const removeBookingText =
  "If you remove this booking, it will be gone forever. But hey, I'm not your mommy, you are in charge";
