import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import MainContainer from "~/components/MainContainer";
import useBooking from "~/hooks/useBooking";

const Joined = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { upcomingBookingsJoined } = useBooking();

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
    <>
      <SubHeader title="Joined" />
      <MainContainer bgFrom="005e1ba6" heightType="h-full">
        <div className="pt-2">
          <Bookings bookings={upcomingBookingsJoined} />
        </div>
      </MainContainer>
    </>
  );
};

export default Joined;
