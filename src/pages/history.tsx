import { type InferGetStaticPropsType, type NextPage } from "next";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { PageLoader } from "~/components/PageLoader";
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

  if (bookingsQuery.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>;
  }
  const { data: bookings } = bookingsQuery;

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }
  console.log(bookings);

  return (
    <div>
      <SubHeader title="History" />
      <Bookings bookings={bookings || []} historyOnly />
    </div>
  );
};

export default History;
