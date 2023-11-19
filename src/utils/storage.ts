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
};

type LocalStorageBookingState = {
  value: PrePopulateBookingState;
  expiry: number;
};

type Props = {
  court?: string | null;
  duration?: number | null;
  time?: string;
  date?: Date;
  association?: Association | null;
  facility?: Facility | null;
  maxPlayers: number | string;
  joinable: boolean;
  isLoading?: boolean;
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

export const getPrePopulationState = (facilities: Facility[] | undefined) => {
  const ls = readPrePopulateBookingState();
  if (ls) {
    return {
      court: ls?.court,
      association: ls?.association,
      duration: Number(ls?.duration),
      maxPlayers: ls?.maxPlayers,
      date: ls?.date,
      time: ls?.time,
      facility: facilities?.find((facility) => facility.id === "1"),
      joinable: ls.joinable,
    } as PrePopulateBookingState;
  }
};
