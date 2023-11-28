import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import MainContainer from "~/components/MainContainer";
import useBooking from "~/hooks/useBooking";

const Created = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const { upcomingBookingsCreated, isUpcomingCreatedBookingsFetched } =
    useBooking();

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  if (sessionStatus === "loading" || !isUpcomingCreatedBookingsFetched) {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#01797391] to-[#000000]"}
      />
    );
  }

  return (
    <>
      <SubHeader title="Booked by me" />
      <MainContainer bgFrom="01797391" heightType="h-full">
        <Bookings bookings={upcomingBookingsCreated} />
      </MainContainer>
    </>
  );
};

export default Created;
