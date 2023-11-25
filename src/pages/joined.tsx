import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";

const Joined = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const bookingsQuery = api.booking.getAll.useQuery(undefined, {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const { data: bookings } = bookingsQuery;

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  if (sessionStatus === "loading") {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#005e1ba6] to-[#000000]"}
      />
    );
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col">
      <SubHeader title="Joined" />
      <Bookings bookings={bookings || []} />
    </main>
  );
};

export default Joined;
