import { z } from "zod";
import crypto from "crypto";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { api } from "~/utils/api";

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
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
          associations: {
            has: input.associationId,
          },
        },
      });

      const existingInvite = await ctx.prisma.invite.findFirst({
        where: {
          email: input.email,
          associationId: input.associationId,
        },
      });

      if (!!existingUser) {
        throw new Error("INVITED_EMAIL_ALREADY_MEMBER");
      }

      if (!!existingInvite) {
        throw new Error("EMAIL_HAS_PENDING_INVITE");
      }

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
