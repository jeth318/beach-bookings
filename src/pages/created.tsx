import { type InferGetStaticPropsType, type NextPage } from "next";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
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

const Created: NextPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const bookingsQuery = api.booking.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (bookingsQuery.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>;
  }
  const { data: bookings } = bookingsQuery;

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <div>
      <SubHeader title="My bookings" />
      <Bookings bookings={bookings || []} createdOnly />
    </div>
  );
};

export default Created;
