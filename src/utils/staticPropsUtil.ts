import superjson from 'superjson';
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from '~/server/db';

export const serverSideHelpers = createServerSideHelpers({
    router: appRouter,
    ctx: {
    session: null,
    prisma,
    },
    transformer: superjson, // optional - adds superjson serialization
});
  

   