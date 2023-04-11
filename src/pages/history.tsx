import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { Header } from "~/components/Header";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { BeatLoader } from "react-spinners";
import Image from "next/image";
import { SubHeader } from "~/components/SubHeader";

const History: NextPage = () => {
  const { isInitialLoading: isInitialLoadingBookings, data: bookings } =
    api.booking.getAll.useQuery();
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }
  return (
    <div>
      <SubHeader title="History" />
      {isInitialLoadingBookings || !bookings?.length ? (
        <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
          <div className="flex flex-col items-center justify-center">
            <h2 className="pb-4 text-2xl text-white">Loading bookings</h2>
            <BeatLoader size={20} color="#36d7b7" />
          </div>
        </div>
      ) : (
        <main className="bg-slate-200 dark:bg-black">
          <div className="min-w-sm flex min-w-fit flex-col bg-gradient-to-b from-[#5c5e5f] to-[#000000]">
            <Bookings historyOnly />
          </div>
        </main>
      )}
    </div>
  );
};

export default History;
