import { z } from "zod";
import crypto from "crypto";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const guestRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.guest.findFirst({
        where: {
          id: input.id,
        },
      });
    }),
  getAllInBooking: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.guest.findMany({
        where: {
          bookingId: input.bookingId,
        },
      });
    }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.guest.findMany({});
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.guest.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        bookingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.guest.create({
        data: {
          id: crypto.randomBytes(10).toString("hex"),
          name: input.name,
          bookingId: input.bookingId,
          invitedBy: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.guest.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
