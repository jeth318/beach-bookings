import { type Booking, type User } from "@prisma/client";
import { type EventType } from "./booking.util";

export type EmailRecipientsProps = {
  sessionUserId: string;
  eventType: EventType;
  booking: Booking;
  users: User[];
};

export type MailOptions = {
  sender?: string;
  recipients: string[];
};

export type Consent = (typeof consentList)[number];

export const consentList = [
  "ADD",
  "DELETE",
  "MODIFY",
  "JOIN",
  "LEAVE",
  "KICK",
] as const;

export const getUsersByBooking = (users: User[], booking: Booking) => {
  return users.filter((user) => booking.players.includes(user.id));
};

export const getConsentIcon = (consent: EventType) => {
  switch (consent) {
    case "ADD":
      return `booking-added`;
    case "DELETE":
      return "booking-removed";
    case "MODIFY":
      return "booking-modified";
    case "JOIN":
      return "user-joined";
    case "LEAVE":
      return "user-left";
    case "KICK":
      return "user-kicked";
    default:
      return "/";
  }
};

export const friendlyConsentName = {
  ADD: {
    name: "Booking added",
    description: "When a player add a new booking",
  },
  DELETE: {
    name: "Booking removed",
    description: "When you are in a booking that gets removed",
  },
  MODIFY: {
    name: "Booking updated",
    description: "When you are in a booking that gets changed",
  },
  JOIN: {
    name: "Player joined",
    description: "When a player joins your party",
  },
  LEAVE: {
    name: "Player left",
    description: "When a player leaves your party",
  },
  KICK: {
    name: "Player kicked",
    description: "When a player is kicked from your party",
  },
  CANCELED: {
    name: "Not implemented",
    description: "No info",
  },
};
