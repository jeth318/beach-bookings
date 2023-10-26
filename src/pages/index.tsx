import { api } from "~/utils/api";
import { Bookings } from "~/components/Bookings";
import { serverSideHelpers } from "~/utils/staticPropsUtil";
import { useEffect, useState } from "react";

export async function getStaticProps() {
  await serverSideHelpers.booking.getAll.prefetch();
  await serverSideHelpers.association.getAll.prefetch();
  await serverSideHelpers.facility.getAll.prefetch();

  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const Home = () => {
  // Fix for server/client render match
  const [hydrated, setHydrated] = useState<boolean>(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const bookingsQuery = api.booking.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  api.association.getForUser.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  api.facility.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (bookingsQuery.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>;
  }
  const { data } = bookingsQuery;

  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col">
      <Bookings bookings={data} />
    </main>
  );
};

export default Home;
