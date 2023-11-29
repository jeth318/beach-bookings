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

  const isLoading =
    sessionStatus === "loading" || !isUpcomingCreatedBookingsFetched;

  const mainContainerProps = {
    subheading: "Booked by me",
    bgFrom: "#02968f91",
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
        <div className="pt-2">
          <Bookings bookings={upcomingBookingsCreated} />
        </div>
      )}
    </MainContainer>
  );
};

export default Created;
