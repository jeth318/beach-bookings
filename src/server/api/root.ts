import { userRouter } from './routers/user';
import { createTRPCRouter } from "~/server/api/trpc";
import { bookingRouter } from "./routers/booking";
import { gbcProxyRouter } from './routers/gbc-proxy';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  booking: bookingRouter,
  user: userRouter,
  gbcProxy: gbcProxyRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
