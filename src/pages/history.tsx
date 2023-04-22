import { type InferGetStaticPropsType, type NextPage } from "next";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { SharedHead } from "~/components/SharedHead";
import { SubHeader } from "~/components/SubHeader";
import { api } from "~/utils/api";
import { serverSideHelpers } from "~/utils/staticPropsUtil";

export async function getStaticProps() {
  await serverSideHelpers.booking.getAll.prefetch();
  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const History = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const bookingsQuery = api.booking.getAll.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: bookings } = bookingsQuery;

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col">
      <SubHeader title="History" />
      <Bookings bookings={bookings || []} />
    </main>
  );
};

export default History;
