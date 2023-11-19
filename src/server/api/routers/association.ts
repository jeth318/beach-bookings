import { z } from "zod";
import crypto from "crypto";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const associationRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.association.findMany({});
  }),
  getMultipleByIds: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const associations = await ctx.prisma.association.findMany({
        where: {
          id: {
            in: input.ids,
          },
        },
      });
      return associations;
    }),

  getSingle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.association.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().or(z.null()),
      })
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.prisma.association.create({
        data: {
          id: crypto.randomBytes(10).toString("hex"),
          userId,
          description: input.description,
          name: input.name,
          admins: [userId],
          members: [userId],
          private: true,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        members: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.association.update({
        where: {
          id: input.id,
        },
        data: {
          members: input.members,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.association.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
