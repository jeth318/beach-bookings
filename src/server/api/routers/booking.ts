import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const bookingRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.booking.findMany({})
  }),
  getForUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.booking.findMany({
      where: {
        userId: ctx.session.user.id
      }
    })
  })

});
