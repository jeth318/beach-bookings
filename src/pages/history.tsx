/* import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import MainContainer from "~/components/MainContainer";
import { SubHeader } from "~/components/SubHeader";
import { api } from "~/utils/api";
import { serverSideHelpers } from "~/utils/staticPropsUtil";

export async function getStaticProps() {
  await serverSideHelpers.booking.getHistorical.prefetch();
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
  const bookingsQuery = api.booking.getHistorical.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: bookings } = bookingsQuery;

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <MainContainer>
      <SubHeader title="History" />
      <Bookings bookings={bookings || []} />
    </MainContainer>
  );
};

export default History;
 */
