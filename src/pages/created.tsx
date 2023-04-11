import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { Header } from "~/components/Header";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { BeatLoader } from "react-spinners";
import Image from "next/image";
import { SubHeader } from "~/components/SubHeader";

const Created: NextPage = () => {
  const { isInitialLoading: isInitialLoadingBookings, data: bookings } =
    api.booking.getAll.useQuery();
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <div>
      <SubHeader title="My bookings" />
      <main className="bg-slate-200 dark:bg-black">
        <div className="min-w-sm flex min-w-fit flex-col">
          <Bookings createdOnly />
        </div>
      </main>
    </div>
  );
};

export default Created;
