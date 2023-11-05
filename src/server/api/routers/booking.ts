import { z } from "zod";
import crypto from "crypto";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const bookingRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.booking.findMany({});
  }),
  getForUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.booking.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  getUpcomingForUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.booking.findMany({
      where: {
        userId: ctx.session.user.id,
        date: {
          gte: new Date(),
        },
      },
    });
  }),
  getJoined: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.booking.findMany({
      where: {
        players: {
          has: ctx.session.user.id,
        },
      },
    });
  }),
  getJoinedUpcoming: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.booking.findMany({
      where: {
        players: {
          has: ctx.session.user.id,
        },
        date: {
          gte: new Date(),
        },
      },
    });
  }),
  getSingle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.booking.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        court: z.string().or(z.null()),
        date: z.date(),
        associationId: z.string().or(z.null()),
        facilityId: z.string().or(z.null()),
        maxPlayers: z.number().or(z.null()),
        duration: z.number().or(z.null()),
        joinable: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.booking.create({
        data: {
          id: crypto.randomBytes(10).toString("hex"),
          userId: input.userId,
          players: [ctx.session.user.id],
          court: input.court,
          date: input.date,
          duration: input.duration || 0,
          associationId: input.associationId,
          facilityId: input.facilityId,
          maxPlayers: input.maxPlayers === null ? 0 : input.maxPlayers,
          joinable: input.joinable,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        duration: z.number().or(z.null()),
        court: z.string().or(z.null()),
        date: z.date(),
        players: z.string().array(),
        association: z.string().or(z.null()),
        facility: z.string().or(z.null()),
        maxPlayers: z.number().or(z.null()),
        joinable: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.booking.update({
        where: {
          id: input.id,
        },
        data: {
          court: input?.court,
          date: input.date,
          duration: input.duration || 0,
          players: input.players,
          facilityId: input.facility,
          associationId: input.association,
          maxPlayers: input.maxPlayers,
          joinable: input.joinable,
        },
      });
    }),
  updateJoinable: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        joinable: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.booking.update({
        where: {
          id: input.id,
        },
        data: {
          joinable: input.joinable,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.booking.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
