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
  const { upcomingBookingsJoined, isUpcomingCreatedBookingsFetched } =
    useBooking();

  const isLoading =
    sessionStatus === "loading" || !isUpcomingCreatedBookingsFetched;
  const mainContainerProps = {
    subheading: "Joined",
    bgFrom: "005e1ba6",
    heightType: "h-full",
  };

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <MainContainer {...mainContainerProps}>
      {isLoading ? (
        <PageLoader />
      ) : (
        <Bookings bookings={upcomingBookingsJoined} />
      )}
    </MainContainer>
  );
};

export default Joined;
