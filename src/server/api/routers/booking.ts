import { z } from "zod";
import crypto from "crypto";


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
  }),
  getSingle: protectedProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.prisma.booking.findUnique({
      where: {
        id: input.id
      }
    })
  }),
  create: protectedProcedure.input(z.object({ userId: z.string(), court: z.number().or(z.null()), date: z.date()})).mutation(({ ctx, input }) => {
    return ctx.prisma.booking.create({
      data: {
        id: crypto.randomBytes(10).toString("hex"),
        userId: input.userId,
        players: [ctx.session.user.id],
        court: input.court,
        date: input.date,
      }
    })
  }),
  update: protectedProcedure.input(z.object({ id: z.string(), duration: z.number(), court: z.number().or(z.null()), date: z.date(), players: z.string().array()})).mutation(({ ctx, input }) => {
    return ctx.prisma.booking.update({
      where: {
        id: input.id
      },
      data: {
          court: input?.court,
          date: input.date,
          duration: input.duration,
          players: input.players
      }
    })
  }),
  delete: protectedProcedure.input(z.object({ id: z.string()})).mutation(({ ctx, input }) => {
    return ctx.prisma.booking.delete({
      where: {
        id: input.id
      }
    })
  }),

});
