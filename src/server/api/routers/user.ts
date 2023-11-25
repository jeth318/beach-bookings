import { array, z } from "zod";
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
  getMultipleByIds: protectedProcedure
    .input(
      z.object({
        playerIds: z.string().array().or(z.null()),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.playerIds?.length) {
        return [];
      }
      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: input.playerIds },
        },
      });

      return users.map((user) => ({
        id: user.id,
        emailConsents: user.emailConsents,
        name: user.name,
        image: user.image,
      }));
    }),

  getGroupUsersByIds: publicProcedure
    .input(
      z.object({
        playerIds: z.string().array().or(z.null()),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.playerIds?.length) {
        return [];
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          id: { in: input.playerIds },
        },
      });

      return users.map((user) => ({
        id: user.id,
        name: user.name,
        emailConsents: user.emailConsents,
      }));
    }),
  getUsersByAssociationId: protectedProcedure
    .input(
      z.object({
        associationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany({
        where: {
          associations: { has: input.associationId },
        },
      });

      return users.map((user) => ({
        id: user.id,
        name: user.name,
        image: user.image,
        email: user.email,
        emailConsents: user.emailConsents,
      }));
    }),

  getSingle: protectedProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user?.id) {
        return null;
      }

      return {
        id: user?.id,
        name: user?.name,
        associations: user?.associations,
      };
    }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!user?.id) {
        return null;
      }

      return {
        id: user?.id,
        name: user?.name,
      };
    }),
  // CALL ONLY FROM SERVER
  getAllWithEmail: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({});
  }),
  getMultipleByIdsIncludingEmailAndConsents: protectedProcedure
    .input(
      z.object({
        playerIds: z.string().array(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          id: { in: input.playerIds },
        },
      });
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
  updateAssociations: protectedProcedure
    .input(
      z.object({
        associations: z.array(z.string()),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          associations: input.associations,
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
