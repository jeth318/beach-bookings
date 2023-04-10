import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { Header } from "~/components/Header";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { BeatLoader } from "react-spinners";

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
      <Header noBoxShadow />
      <div className="text-gray sticky top-16 z-30 bg-slate-800 p-2 text-center text-lg text-slate-400 shadow-md shadow-stone-900">
        History
      </div>

      {isInitialLoadingBookings || !bookings?.length ? (
        <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
          {isInitialLoadingBookings ? (
            <div className="flex flex-col items-center justify-center">
              <h2 className="pb-4 text-2xl text-white">Loading bookings</h2>
              <BeatLoader size={20} color="#36d7b7" />
            </div>
          ) : (
            <h2 className="text-2xl text-white">No bookings found! 😥🌴</h2>
          )}
        </div>
      ) : (
        <main className="h-screen" style={{ backgroundColor: "currentcolor" }}>
          <div className="min-w-sm flex min-w-fit flex-col bg-gradient-to-b from-[#5c5e5f] to-[#2c2d2c]">
            <Bookings historyOnly />
          </div>
        </main>
      )}
    </div>
  );
};

export default History;
