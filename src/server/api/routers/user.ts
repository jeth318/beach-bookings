import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({});

    return users.map((user) => ({ ...user, email: "" }));
  }),
  getMultipleByIds: publicProcedure
    .input(
      z.object({
        playerIds: z.string().array(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: input.playerIds },
        },
      });

      return users.map((user) => ({
        id: user.id,
        emailConsents: user.emailConsents,
      }));
    }),
  // CALL ONLY FROM SERVER
  getAllWithEmail: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({});
  }),
  getUserIdsWithAddConsent: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      where: {
        emailConsents: {
          has: "ADD",
        },
      },
    });
    return users.map((user) => ({
      id: user.id,
      emailConsents: user.emailConsents,
    }));
  }),
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),
  updateEmailConsents: protectedProcedure
    .input(
      z.object({
        emailConsents: z.string().array(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          emailConsents: input.emailConsents,
        },
      });
    }),
  updateName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),
  updatePhone: protectedProcedure
    .input(
      z.object({
        number: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          phone: input.number,
        },
      });
    }),
  delete: protectedProcedure.mutation(({ ctx }) => {
    return ctx.prisma.user.delete({
      where: {
        id: ctx.session.user.id,
      },
    });
  }),
});
