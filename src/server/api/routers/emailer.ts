/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const sender = process.env.EMAIL_DISPATCHER_ADDRESS;
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
          emailAddresses.forEach((recipient) => {
            try {
              if (!!recipient) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                transporter.sendMail({
                  ...getMailOptions({ sender, recipients: [recipient] }),
                  html: input.htmlString,
                  subject,
                });
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
        } else {
          console.log("Email dispatcher not active");
        }
      } catch (error) {}
    }),
});
