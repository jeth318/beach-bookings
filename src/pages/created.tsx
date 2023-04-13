import { type InferGetStaticPropsType, type NextPage } from "next";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { serverSideHelpers } from "~/utils/staticPropsUtil";
import { PageLoader } from "~/components/PageLoader";

export async function getStaticProps() {
  await serverSideHelpers.booking.getAll.prefetch();
  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const Created = () => {
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

  if (sessionStatus === "loading") {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#01797391] to-[#000000]"}
      />
    );
  }

  return (
    <div>
      <SubHeader title="Booked by" />
      <Bookings bookings={bookings || []} createdOnly />
    </div>
  );
};

export default Created;
