import { type User, type Booking } from "@prisma/client";
import { type EventType, getTimeWithZeroPadding } from "./booking.util";
import { type SetStateAction } from "react";
import { beachBookingsSpikeLogoBase64 } from "./image.util";
import { type NextRouter } from "next/router";

type EmailRecipientsProps = {
  sessionUserId: string;
  eventType: EventType;
  playersInBooking?: string[];
  users?: { id: string; emailConsents: string[] }[] | undefined;
};

type MailOptions = {
  sender?: string;
  recipients: string[];
};

export const getQueryId = (router: NextRouter) =>
  Array.isArray(router.query.id)
    ? router?.query?.id[0] || ""
    : router?.query?.id || "";

export const toastMessages = {
  ADD: "Your booking was successfully published",
  JOIN: "You successfully joined the booking",
  LEAVE: "Successfully left the booking",
  DELETE: "Your booking was successfully removed",
  MODIFY: "Your booking was successfully updated",
  KICK: "Player was kicked",
  CANCELED: "Something was canceled",
};

export const associationToastMessages = {
  LEAVE: "You left the group",
  DELETE: "The group is now deleted",
  MODIFY: "The group was updated",
};

export type DropdownItem = {
  text: string;
  href: string;
  icon: string;
};

export const userMenuItems = [
  {
    text: "Settings",
    href: "/settings",
    icon: "settings.svg",
  },
  {
    text: "Settings",
    href: "/",
    icon: "logout.svg",
  },
];

export const isServerSide = typeof window === "undefined";
export const menuItems: DropdownItem[] = [
  {
    text: "Publish",
    href: "/booking",
    icon: "add-circle.svg",
  },
  {
    text: "Home",
    href: "/",
    icon: "home.svg",
  },
  {
    text: "Joined",
    href: "/joined",
    icon: "handshake.svg",
  },
  {
    text: "Booked",
    href: "/created",
    icon: "crown.svg",
  } /*
     {
    text: "History",
    href: "/history",
    icon: "history.svg",
  },
  */,
  /*{
    text: "Groups",
    href: "/association",
    icon: "people.svg",
  },*/
];

export const renderToast = (
  message: string,
  stateSetter: (value: SetStateAction<string | undefined>) => void
) => {
  stateSetter(message);
  setTimeout(() => {
    stateSetter(undefined);
  }, 3000);
};

export const getUsersByBooking = (users: User[], booking: Booking) => {
  return users.filter((user) => booking.players.includes(user.id));
};

export const getMailOptions = ({ sender, recipients }: MailOptions) => {
  return {
    from: {
      address: sender,
      name: "Beach Bookings",
    },
    to: [recipients],
    attachments: [
      {
        // encoded string as an attachment
        filename: "beach-spike-small.png",
        cid: "beach-spike-small",
        path: `data:image/gif;base64,${beachBookingsSpikeLogoBase64}`,
      },
    ],
  };
};

export const getEmailRecipients = ({
  users = [],
  playersInBooking = [],
  sessionUserId,
  eventType,
}: EmailRecipientsProps) => {
  if (eventType === "ADD") {
    try {
      return users
        .filter((user) => user.id !== sessionUserId)
        .filter((user) => user.emailConsents.includes("ADD"))
        .map((user) => user.id);
    } catch (error) {}
  }

  return users
    .filter((user) => playersInBooking.includes(user.id))
    .filter((user) => user?.emailConsents?.includes(eventType))
    .filter((user) => user.id !== sessionUserId)
    .map((user) => user.id);
};

export const getEmailTitle = (eventType: EventType) => {
  switch (eventType) {
    case "ADD":
      return "New booking published 🟢";
    case "MODIFY":
      return "Booking changed 🟠";
    case "DELETE":
      return "Booking removed 🔴";
    case "JOIN":
      return "A player joined the party! 🎉";
    case "KICK":
    case "LEAVE":
      return "A player left the party 😿";
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
      } just published a booking. Let's get a full squad!`;
    case "MODIFY":
      return `${
        bookerName || "The booking creator"
      } updated a booking you are listed in.`;
    case "DELETE":
      return `${
        bookerName || "The booker"
      } just removed a booking where you were listed in. Sad story!`;
    case "JOIN":
      return `${playerName || "This fellow player"} looks eager to play.`;
    case "LEAVE":
      return `${
        playerName
          ? `${playerName} left your party. It's time to find a replacement if you haven't already!`
          : "It's time to find a replacement if you haven't already!"
      }`;
    case "KICK":
      return `${"A player"} was kindly and respectfully kicked from your party by the booking owner. No questions asked, we are still friends.`;
    default:
      return "Yo beach player!";
  }
};

export const getEmailHeading = (eventType: string) => {
  switch (eventType) {
    case "ADD":
      return `An opportunity to play!`;
    case "MODIFY":
      return "Sometimes stuff changes.";
    case "DELETE":
      return `Game over`;
    case "JOIN":
      return `Reinforcements incoming!`;
    case "LEAVE":
    case "KICK":
      return `A player had to leave.`;
    default:
      return "Yo beach player.";
  }
};

export const getFrogText = (path: string) => {
  const history = path === "/history";
  const joined = path === "/joined";
  const created = path === "/created";
  const invite = path.startsWith("/invite");
  const details = path.startsWith("/booking/details");
  const association = path.startsWith("/association");

  if (joined) {
    return "You have not joined any upcoming bookings 🐸";
  }

  if (created) {
    return "You have not published any upcoming bookings 🐸";
  }

  if (history) {
    return "No old bookings yet...";
  }

  if (invite) {
    return "Hmm, looks like this invite link is invalid. Talk to the inviter.";
  }

  if (details) {
    return "Hmm, looks like this booking is for another group of players.";
  }

  if (association) {
    return "You are not a member of the requested group. An existing group member can invite you. Talk to them.";
  }

  return "There are no upcoming bookings right now. Head over to <a class='link' href='https://gbc.goactivebooking.com/'>GBC</a>, book a court and comeback here and publish.";
};

export const removeBookingText =
  "If you remove this booking, it will be gone forever. But hey, I'm not your mommy, you are in charge";

export const leaveBookingText =
  "If you leave, the members in this booking will be notified by email. Be a hero and help your fellow players find a replacement.";

export const joinBookingText =
  "If you join, the members in this booking will be notified by email. Your email address will be visible for the other players in this booking.";

export const removeAssociationText =
  "If you remove this group, it will be gone forever. Are you sure? Existing group members might still want to have the group active. Consider transferring ownership of the group instead of deleting. To do this, enter the EDIT-view";

export const leaveAssociationText =
  "If you leave this group, you won't be able to join again until an existing member invites you again.";
