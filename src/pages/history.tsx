import { type NextPage } from "next";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { SubHeader } from "~/components/SubHeader";

const History: NextPage = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }
  return (
    <div>
      <SubHeader title="History" />
      <main className="bg-slate-200 dark:bg-black">
        <div className="min-w-sm flex min-w-fit flex-col ">
          <Bookings historyOnly />
        </div>
      </main>
    </div>
  );
};

export default History;
