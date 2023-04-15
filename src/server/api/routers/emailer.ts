import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
  } from "~/server/api/trpc";
import { generateEmailContent, mailOptions, transporter } from "~/utils/nodemailer.util";
  
  export const emailerRouter = createTRPCRouter({
    sendEmail: protectedProcedure.input(z.object({ bookingId: z.string(), players: z.string().array() })).mutation(async ({ ctx, input }) => {
        try {
          await transporter.sendMail({
            ...mailOptions,
            ...generateEmailContent({}),
            subject: "Booking was updated",
          });
          return {
            success: true,
            data: "success!"
          }
        } catch (err) {
          console.log(err);
          return { success:false, message: err?.message };
        }
    }),
  });
  