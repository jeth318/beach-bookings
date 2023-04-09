import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { Header } from "~/components/Header";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";

const Joined: NextPage = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }
  return (
    <div>
      <Header noBoxShadow />
      <div className="text-gray sticky top-16 z-30 bg-slate-800 p-2 text-center text-lg text-slate-400 shadow-xl shadow-stone-900">
        Joined games
      </div>
      <div style={{ backgroundColor: "#2f2f2f" }}>
        <Bookings joinedOnly={true} />
      </div>
    </div>
  );
};

export default Joined;
