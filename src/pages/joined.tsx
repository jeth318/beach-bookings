import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";

const Joined: NextPage = () => {
  const { isInitialLoading: isInitialLoadingBookings, data: bookings } =
    api.booking.getAll.useQuery();
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }
  return (
    <div>
      <SubHeader title="Joins" />
      <Bookings joinedOnly />
    </div>
  );
};

export default Joined;
