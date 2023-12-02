import { type Association, type Facility } from "@prisma/client";
import { type EventType } from "~/utils/booking.util";

type PrePopulateBookingState = {
  court?: string;
  duration?: number;
  date: Date;
  time: string;
  facility: Facility;
  association: Association;
  eventType: EventType;
  maxPlayers?: number;
  joinable: boolean;
  privateBooking: boolean;
};

type LocalStorageBookingState = {
  value: PrePopulateBookingState;
  expiry: number;
};

export const readPrePopulateBookingState = ():
  | PrePopulateBookingState
  | undefined => {
  try {
    const outputString = localStorage.getItem("booking-state") || "";

    if (!outputString) {
      return undefined;
    }

    const item = JSON.parse(outputString) as LocalStorageBookingState;
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem("booking-state");
      return undefined;
    }

    return item.value;
  } catch (error) {
    console.error("Could not parse booking-state", error);
    return undefined;
  }
};

export const getPrePopulationState = () => {
  const ls = readPrePopulateBookingState();
  if (ls) {
    return {
      court: ls?.court,
      association: ls?.association,
      duration: Number(ls?.duration),
      maxPlayers: ls?.maxPlayers,
      date: ls?.date,
      time: ls?.time,
      facility: ls?.facility,
      joinable: ls.joinable,
      privateBooking: ls.privateBooking,
    } as PrePopulateBookingState;
  }
};
