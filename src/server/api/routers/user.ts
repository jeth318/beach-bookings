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
  // CALL ONLY FROM SERVER
  getAllWithEmail: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({});
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
});
