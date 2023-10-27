/* eslint-disable @typescript-eslint/no-unsafe-call */
import nodemailer from "nodemailer";

const user = process.env.EMAIL_DISPATCH_ADDRESS;
const smtpAddress = process.env.EMAIL_DISPATCH_SMTP;
const pass = process.env.EMAIL_DISPATCH_PASSWORD;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
export const transporter = nodemailer.createTransport({
  host: smtpAddress,
  //port: 587,
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user,
    pass,
  },
});
