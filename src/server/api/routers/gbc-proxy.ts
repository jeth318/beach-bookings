import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import crypto from "crypto";

import { checkUser, generatePasswordHash } from "~/server/utils/server.util";

const verificationToken = process.env.GBCPROXY_VERIFICATION_SECRET;


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

    if (gbcAccount?.id) {
      console.warn("GBC-account already linked");
      return {
        success: false,
        message: "GBC-account already linked"
      }
    }

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
  getGbcBookings: protectedProcedure.input(z.object({ accessToken: z.string().or(z.null()) })).query(async ({ ctx, input }) => {
    const gbcAccount = await ctx.prisma.gbcAccount.findUnique({
      where: {
        userId: ctx.session?.user.id
      }
    })

    if (!input?.accessToken) {
      return { success: false, data: [] };
    }


    if (!verificationToken) {
      return { success: false, data: [] };
    }

    const res = await fetch(`http://localhost:3001/api/bookings/${gbcAccount?.gbcUserId}`, {
      headers: {
        'x-verification-secret': process.env.GBCPROXY_VERIFICATION_SECRET,
        'x-access-token': input?.accessToken
      }
    });

    console.log("res.status", res.status);
    
    if (res.status === 200) {
      const data = await res.json();
      const bookings: GbcBooking[] = data?.data; 
      return { success: true, data: bookings?.data || [] };
    } 
    return { success: false, data: [] };
  }),
  getForUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.gbcAccount.findUnique({
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
    return ctx.prisma.gbcAccount.delete({
      where: {
        id: input.id
      }
    })
  }),
});

type ServiceProduct = {
  id: number;
  name: string;
};

export type GbcBooking = {
  id: number;
  serviceProduct: ServiceProduct;
  businessUnit: BusinessUnit;
  customer: Customer;
  duration: Duration;
  order: Order;
  isDebited: boolean;
  price: Price;
  shouldAutoRefundOnCancel: boolean;
  selectedResource: SelectedResource;
};

type BusinessUnit = {
  id: number;
  name: string;
  location: string;
  companyNameForInvoice: string;
};

type Customer = {
  id: number;
  firstName: string;
  lastName: string;
};

type Duration = {
  start: string;
  end: string;
};

type Order = {
  id: number;
  number: string;
  externalId: null | string;
  lastModified: string;
};

type Price = {
  amount: number;
  currency: string;
};

type SelectedResource = {
  id: number;
  name: string;
  type: string;
};
