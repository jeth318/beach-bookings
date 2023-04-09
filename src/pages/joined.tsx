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
      <Header />
      <div className="sticky top-16 z-30 bg-primary p-2 text-center text-2xl">
        Joined games
      </div>
      <div style={{ backgroundColor: "#2f2f2f" }}>
        <Bookings joinedOnly={true} />
      </div>
    </div>
  );
};

export default Joined;
