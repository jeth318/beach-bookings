import { type User, type Booking, type Session } from '@prisma/client';
import { type EventType } from './booking.util';
/* eslint-disable @typescript-eslint/no-unsafe-call */
import nodemailer from "nodemailer";

const email = process.env.GMAIL_ACCOUNT_FOR_DISPATCH;
const pass = process.env.GMAIL_APP_SPECIFIC_PASSWORD;
const isEmailDispatcherActive = process.env.EMAIL_DISPATCH_ACTIVE;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass,
  },
});

type EmailRecipientsProps = {
  sessionUserId: string;
  eventType: EventType;
  booking: Booking;
  users: User[];
}

export const getEmailRecipiants = ({ users, booking, sessionUserId, eventType }: EmailRecipientsProps) => {
  if (eventType === "ADD") {
    return users
    .filter((user) => user.id !== sessionUserId)
    .map((user) => user.email)
    .filter((email) => !!email) as string[];
  }

  return users
    .filter((user) => booking.players.includes(user.id))
    .filter((user) => user.id !== sessionUserId)
    .map((user) => user.email)
    .filter((email) => !!email) as string[];
}

export const getMailOptions = (recipients?: string[]) =>  {
console.log("WOULD HAVE SEND EMAIL TO:", recipients);

console.log(email, pass, isEmailDispatcherActive);


// DONT REMVOVE UNTIL PERFECTLY DONE.
const hardCodedEmailsForTesting = [
  "shopping.kalle.stropp@gmail.com",
  "public.kalle.stropp@gmail.com",
  "jesper.thornberg@me.com",
]

  return {
    from: email,
    to: isEmailDispatcherActive ? hardCodedEmailsForTesting : hardCodedEmailsForTesting,
  } 
};

