/* eslint-disable @typescript-eslint/no-unsafe-member-access */
const sender = process.env.GMAIL_ACCOUNT_FOR_DISPATCH;
const pass = process.env.GMAIL_APP_SPECIFIC_PASSWORD;
const isEmailDispatcherActive = process.env.EMAIL_DISPATCH_ACTIVE;
console.log({ isEmailDispatcherActive, whatType: typeof isEmailDispatcherActive });


const hardCodedEmailsForTesting = [
  // "shopping.kalle.stropp@gmail.com",
  "public.kalle.stropp@gmail.com",
  // "jesper.thornberg@me.com",
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

      // const emailRecipients: string[] = hardCodedEmailsForTesting;
    console.log({ secondRound: "yes", isEmailDispatcherActive, whatType: typeof isEmailDispatcherActive });

      if (isEmailDispatcherActive === "true") {
        console.warn("Email dispatcher is active");
        try {
          console.log("WOULD HAVE SENT EMAIL TO: ", input.recipients);
          
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await transporter.sendMail({
            ...getMailOptions({ sender, recipients: hardCodedEmailsForTesting }),
            html: input.htmlString,
            subject,
            /*attachments: [{
                filename: 'cig-frog-still.png',
                path: path.join(process.cwd(), 'public'),
                cid: 'unique@nodemailer.com' //same cid value as in the html img src
            }],*/
          });
          return {
            success: true,
            data: "success!",
          };
        } catch (err) {
          console.log(err);
          return { success: false, message: "Error" };
        }
      } else {
        console.log("Email dispatcher not active");
      }
    }),
});
