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
    bgFrom: "[#007621a6]",
    heightType: isLoading ? "h-screen" : "h-full",
  };

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <MainContainer {...mainContainerProps}>
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="pt-2">
          <Bookings bookings={upcomingBookingsJoined} />
        </div>
      )}
    </MainContainer>
  );
};

export default Joined;
