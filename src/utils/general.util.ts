import { type Booking } from "@prisma/client";
import { type EventType, getTimeWithZeroPadding } from "./booking.util";

export const getEmailTitle = (eventType: EventType) => {
    switch(eventType) {
        case "ADD":
            return "New booking added";
        case "MODIFY":
            return "Booking changed";
        case "DELETE":
            return "Booking removed"
        case "JOIN":
            return "A player joined the party!"
        case "LEAVE":
            return "A player left the party!!"
        default:
            return "Got some updates for you."
    }
}

export const getPreheader = (eventType: EventType) => {
    switch(eventType) {
        case "ADD":
        case "JOIN":
            return "Arrogant frog comes with great news! 🥳";
        case "MODIFY":
            return "Arrogant frog has some news!";
        case "DELETE":
        case "LEAVE":
            return "Arrogant frog comes with sad news! 😿"
        default:
            return "Yo beach player!"
    }   
}

type EmailIngressProps = {
    bookerName?: string | "";
    playerName?: string | "A player";
    eventType: EventType
}
export const getEmailBody = ({ bookerName = "The booker", playerName, eventType }: EmailIngressProps) => {
    switch(eventType) {
        /*case "ADD":
            return `<p>${bookerName} just added a brand new booking. Hurry up and join before it's too late mate!</p>`;
        case "MODIFY":
            return `<p>${bookerName} just updated a booking you are listed in.`;
        case "DELETE":
            return `<p>${bookerName} just removed a booking you are listed in. Sad but true.</p>`;
        case "JOIN":
            return `<p>${playerName || "A player"} just joined a booking you are listed in. Oh yeah!.</p>`
        
        case "LEAVE":
            return `<p>${playerName || "A player"} just left a booking you are listed in. Sad times. Try to find a replacement!</p>`
            */
        default:
            return ""
    }
}
type GetEmailBodyProps = {
    eventType: string,
    booking: Booking;
    bookerName?: string;
    playerName?: string
}

export const getPrettyDate = (booking: Booking) => booking.date.toLocaleDateString("sv-SE");
export const getPrettyTime = (booking: Booking) => getTimeWithZeroPadding(booking.date.getHours(), booking.date.getMinutes());

export const getEmailIngress = ({ eventType, booking, playerName, bookerName }:  GetEmailBodyProps) => {
    switch(eventType) {
        case "ADD":
            return `${bookerName || "A player"} added a new booking scheduled for <strong>${getPrettyDate(booking)} (${getPrettyTime(booking)})</strong>. Let's get a full squad!`
        case "MODIFY":
            return `${bookerName || "A player"} updated a booking that you are listed in</strong>.`
        case "DELETE":
            return  `${bookerName || "The booker"} just removed a booking that you are listed in. The booking was scheduled for <strong>${getPrettyDate(booking)} (${getPrettyTime(booking)})</strong> `;
        case "JOIN":
            return `${playerName || "A player"} joined the party scheduled for <strong>${getPrettyDate(booking)} (${getPrettyTime(booking)})</strong>. Game on!`
        case "LEAVE":
            return `${playerName || "A player"} left a party you are listed in. The party is scheduled for <strong>${getPrettyDate(booking)} (${getPrettyTime(booking)})</strong>. Sad, yes yes. But hey, try to find a replacement!`
        default:
            return "Yo beach player!"
    }
}

export const getEmailHeading = (eventType: string) => {
    switch(eventType) {
        case "ADD":
            return `New booking added`;
        case "MODIFY":
            return "Booking changed";
        case "DELETE":
            return `Booking removed`;
        case "JOIN":
            return `A player joined the party`;
        case "LEAVE":
            return `A player left the party`
        default:
            return "Yo beach player."   
    }
}

export const getFrogText = (path: string) => {
    const history = path === "/history";
    const joined = path === "/joined";
    const created = path === "/created";   

    if (joined) {
        return "Ey, this is looking quite lonely."
    }

    if (created) {
        return "You have no active bookings 🐸";
    }

    if (history) {
        return "No old bookings yet...";
    }

    return "No bookings found. Either we have to step it up and start playing and adding bookings, or else there is a bug somewhere in the code 🐸";
} 

export const removeBookingText = "If you remove this booking, it will be gone forever. But hey, I'm not your mommy, you are in charge"