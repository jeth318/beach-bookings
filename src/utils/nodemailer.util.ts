/* eslint-disable @typescript-eslint/no-unsafe-call */
import nodemailer from "nodemailer";

const email = process.env.GMAIL_ACCOUNT_FOR_DISPATCH;
const pass = process.env.GMAIL_APP_SPECIFIC_PASSWORD;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass,
  },
});

export const mailOptions = {
  from: email,
  to: email,
};

