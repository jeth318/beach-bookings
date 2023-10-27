/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const sender = process.env.EMAIL_DISPATCH_ADDRESS;
const isEmailDispatcherActive = process.env.EMAIL_DISPATCH_ACTIVE;

const hardCodedEmailsForTesting = [
  "shopping.kalle.stropp@gmail.com",
  "public.kalle.stropp@gmail.com",
  "jesper.thornberg@me.com",
];

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getEmailHeading, getMailOptions } from "~/utils/general.util";
import { transporter } from "~/utils/nodemailer.util";

export const emailerRouter = createTRPCRouter({
  sendEmail: protectedProcedure
    .input(
      z.object({
        recipients: z.string().array(),
        eventType: z.string(),
        htmlString: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subject = getEmailHeading(input.eventType);

      try {
        const users = await ctx.prisma.user.findMany({});

        const emailAddresses = users
          .filter((user) => input.recipients.includes(user.id))
          .map((user) => user.email);

        console.log({ emailAddresses });

        const verificationPromise = new Promise((resolve, reject) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          transporter.verify((error: any, success: any) => {
            if (error) {
              console.log(error);
              reject(error);
            } else {
              console.log(
                `Nodemailer verification OK. Server is ready to receive messages`
              );
              resolve(success);
            }
          });
        });

        if (isEmailDispatcherActive === "true") {
          console.warn("Email dispatcher is active");
          const promises = emailAddresses.map((recipient, index) => {
            return new Promise((resolve, reject) => {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call
              transporter.sendMail(
                {
                  ...getMailOptions({ sender, recipients: [recipient || ""] }),
                  html: input.htmlString,
                  subject,
                },
                (err: unknown, info: unknown) => {
                  if (err) {
                    console.error(err);
                    reject(err);
                  } else {
                    console.log(`Email was sent successfully ${index}`);
                    resolve(info);
                  }
                }
              );
            });
          });

          console.log(promises);
          const resolved = await Promise.all([verificationPromise, promises]);
          console.log({ resolved });
          return true;
        }
      } catch (error) {
        console.error("Emailer had issues:", error);
      }
    }),
});
