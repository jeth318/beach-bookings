import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import crypto from "crypto";

import { checkUser, generatePasswordHash } from "~/server/utils/server.util";

export const gbcProxyRouter = createTRPCRouter({
  linkAccount: protectedProcedure.input(z.object({ email: z.string(), password: z.string()})).mutation(async ({ ctx, input }) => {
    if (!input?.email || !input?.password) {
      return "Credentials not provided"
    } 

    const gbcAccount = await ctx.prisma.gbcAccount.findUnique({
      where: {
        userId: ctx.session?.user.id
      }
    })

    /*if (gbcAccount?.id) {
      console.warn("GBC-account already linked");
      return {
        success: false,
        message: "GBC-account already linked"
      }
    }*/

    const gbcAuthResponse = await fetch("http://localhost:3001/api/gbc-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: input?.email, pass: input?.password })
    })

    if (gbcAuthResponse.status !== 200) {
      console.warn("GBC-account could not be verified");

      return {
        success: false,
        message: "GBC-account could not be verified"
      } 
    }

    const gbcData = await gbcAuthResponse.json();
    console.log(gbcAuthResponse.headers);    

    if (!gbcData) {
      console.warn("No GBC-data");

      return {
        success: false,
        message: "No GBC-data"
      }  
    }


    const payload = {
      id: crypto.randomBytes(10).toString("hex"),
      gbcUserId: gbcData.user_id,
      email: input.email,
      passwordHash: generatePasswordHash(input?.password),
      userId: ctx.session.user.id 
    };
    
    await ctx.prisma.gbcAccount.create({data: payload})

    return gbcData;

  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    
    const gbcAccount = await ctx.prisma.gbcAccount.findUnique({
      where: {
        userId: ctx.session?.user.id
      }
    })

    console.log({"ctx": ctx.session?.user?.id});
      
    
    const res = await fetch(`http://localhost:3001/api/bookings/${gbcAccount?.gbcUserId}`, {
      headers: {
        'x-verification-secret': process.env.GBCPROXY_VERIFICATION_SECRET,
        'x-access-token': process.env.GBCPROXY_ACCESS_TOKEN
      }
    });

    console.log("res.status", res.status);
    
    if (res.status === 200) {
      const data = await res.json();
      return data;
    } 
    return {};
  }),
  getForUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.gbcAccount.findMany({
      where: {
        userId: ctx.session.user.id
      }
    })
  }),
  update: protectedProcedure.input(z.object({ id: z.string(), username: z.string(), password: z.string()})).mutation(({ ctx, input }) => {
    return ctx.prisma.booking.update({
      where: {
        id: input.id
      },
      data: {
          username: input?.username,
          password: input?.password,
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
