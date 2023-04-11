import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { BeatLoader } from "react-spinners";
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
        <main className="">
          <div className="min-w-sm flex min-w-fit flex-col">
            <Bookings joinedOnly />
          </div>
        </main>
    </div>
  );
};

export default Joined;
