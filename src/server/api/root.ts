import { userRouter } from "./routers/user";
import { createTRPCRouter } from "~/server/api/trpc";
import { bookingRouter } from "./routers/booking";
import { emailerRouter } from "./routers/emailer";
import { associationRouter } from "./routers/association";
import { facilityRouter } from "./routers/facility";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  user: userRouter,
  emailer: emailerRouter,
  association: associationRouter,
  facility: facilityRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
