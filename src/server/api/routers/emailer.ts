/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";
import { getEmailHeading } from "~/utils/general.util";
import { mailOptions, transporter } from "~/utils/nodemailer.util";

const isRemote = process.cwd().includes("var/task");

  export const emailerRouter = createTRPCRouter({
    sendEmail: protectedProcedure.input(z.object({ eventType: z.string(), htmlString: z.string() })).mutation(async ({ ctx, input }) => {
        console.log(process.cwd() + "/public/cig-frog-still.png");
        const subject = getEmailHeading(input.eventType)
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await transporter.sendMail({
            ...mailOptions,
            html: input.htmlString,
            subject,
            /*attachments: [{
                filename: 'cig-frog-still.png',
                path: !isRemote ? process.cwd() : "" + "/public/cig-frog-still.png",
                cid: 'unique@nodemailer.com' //same cid value as in the html img src
            }],*/
          });
          return {
            success: true,
            data: "success!"
          }
        } catch (err) {
          console.log(err);
          return { success:false, message: "Error"};
        }
    }),
  });
  