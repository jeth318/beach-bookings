/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const sender = process.env.EMAIL_DISPATCH_ADDRESS;
const isEmailDispatcherActive = process.env.EMAIL_DISPATCH_ACTIVE;

const hardCodedEmailsForTesting = [
  "shopping.kalle.stropp@gmail.com",
  "public.kalle.stropp@gmail.com",
  "sdsf@@@sdf.sdf",
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

        if (isEmailDispatcherActive === "true") {
          console.warn("Email dispatcher is active");
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          emailAddresses.forEach(async (recipient) => {
            try {
              if (!!recipient) {
                const verification = await new Promise((resolve, reject) => {
                  // verify connection configuration
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  transporter.verify(function (error: any, success: any) {
                    if (error) {
                      console.log(error);
                      reject(error);
                    } else {
                      console.log("Server is ready to take our messages");
                      resolve(success);
                    }
                  });
                });
                console.log("'''''''''''''''''''''", { sender });

                const dispatch = await new Promise((resolve, reject) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                  transporter.sendMail(
                    {
                      ...getMailOptions({ sender, recipients: [recipient] }),
                      html: input.htmlString,
                      subject,
                    },
                    (err: any, info: any) => {
                      if (err) {
                        console.error(err);
                        reject(err);
                      } else {
                        console.log(info);
                        resolve(info);
                      }
                    }
                  );
                });

                console.log({ verification, dispatch });
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                console.log("*************************'");
                console.log("Email was send to:", recipient);
              }
              return {
                success: true,
                data: "success!",
              };
            } catch (err) {
              console.log("EMAIL ERROR", err);
              return { success: false, message: "Error" };
            }
          });
        }
      } catch (error) {}
    }),
});
