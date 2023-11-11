import { z } from "zod";
import crypto from "crypto";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const inviteRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ email: z.string(), associationId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.invite.findFirst({
        where: {
          email: input.email,
          associationId: input.associationId,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        associationId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      console.log({
        associationId: input.associationId,
        email: input.email,
        invitedBy: ctx.session.user.id,
      });

      return ctx.prisma.invite.create({
        data: {
          id: crypto.randomBytes(10).toString("hex"),
          associationId: input.associationId,
          email: input.email,
          invitedBy: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.invite.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
