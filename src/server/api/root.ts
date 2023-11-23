import { inviteRouter } from "./routers/invite";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "~/server/api/trpc";
import { bookingRouter } from "./routers/booking";
import { emailerRouter } from "./routers/emailer";
import { associationRouter } from "./routers/association";
import { facilityRouter } from "./routers/facility";
import { guestRouter } from "./routers/guest";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  user: userRouter,
  invite: inviteRouter,
  emailer: emailerRouter,
  association: associationRouter,
  facility: facilityRouter,
  guest: guestRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
