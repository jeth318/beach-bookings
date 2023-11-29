import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import { CustomIcon } from "~/components/CustomIcon";
import { GuestPlayers } from "~/components/GuestPlayers";
import MainContainer from "~/components/MainContainer";
import { PageLoader } from "~/components/PageLoader";
import { PlayersTable } from "~/components/PlayersTable";
import useGuest from "~/hooks/useGuest";
import useSingleBooking from "~/hooks/useSingleBooking";
import useSingleFacility from "~/hooks/useSingleFacility";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import { getQueryId } from "~/utils/general.util";
import { parseTime } from "~/utils/time.util";

const BookingDetails = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const mainContainerProps = {
    subheading: "Details",
    bgFrom: "2e026d",
  };

  const { booking, isFetchedBooking } = useSingleBooking({
    id: getQueryId(router),
  });
  const { facility, isSingleFacilityFetched } = useSingleFacility({
    facilityId: booking?.facilityId || undefined,
  });
  const { allGuestsInBooking, isAllGuestsInBookingFetched } = useGuest({
    bookingId: booking?.id,
  });

  const { usersInBooking, isUsersInBookingFetched } = useUsersInBooking({
    booking,
  });

  const usersInBookingCount = usersInBooking?.length
    ? usersInBooking?.length
    : 0;

  const allGuestsInBookingCount = allGuestsInBooking?.length
    ? allGuestsInBooking?.length
    : 0;

  const totalPlayerCount = usersInBookingCount + allGuestsInBookingCount;

  const isLoading =
    sessionStatus === "loading" ||
    !isFetchedBooking ||
    !isUsersInBookingFetched ||
    !isSingleFacilityFetched ||
    !isAllGuestsInBookingFetched;

  if (isLoading) {
    return (
      <MainContainer {...mainContainerProps}>
        <PageLoader />
      </MainContainer>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <MainContainer {...mainContainerProps}>
        <ArrogantFrog />
      </MainContainer>
    );
  }

  return (
    <MainContainer {...mainContainerProps}>
      <div className="container p-2 pt-6">
        <div className="mb-4 text-center text-white">
          <div className="flex flex-row items-center justify-center">
            <h2 className="text-2xl">
              {booking?.date.toLocaleDateString("sv-SE")}
            </h2>
            <span className="ml-2 mr-2">-</span>
            <h2>{booking && parseTime(booking)}</h2>
          </div>
          <div className="mt-2 items-center justify-center p-2">
            <div className="flex-flow flex items-center justify-center">
              <span className="pr-1">
                <CustomIcon path="/svg/location-arrow.svg" width={20} />
              </span>
              <h4>{facility?.name}</h4>
            </div>
            <h4>
              <i>{facility?.address}</i>
            </h4>
          </div>
        </div>
        <div>{!!booking && <PlayersTable booking={booking} />}</div>

        <div className="mt-4 p-2">
          <h2 className="mb-2 mt-2 text-center text-xl text-white">
            Add guest
          </h2>

          <div>
            {!!booking && (
              <GuestPlayers users={usersInBooking || []} booking={booking} />
            )}
          </div>
          {totalPlayerCount >= 4 ? (
            <h5 className="text-center">
              No more guests can be added due to the booking already is full.
            </h5>
          ) : (
            <h4 className="mb-2 mt-4 text-center text-white">
              If you have a friend without an account, or if you are in a hurry,
              you can add them as a guest.
            </h4>
          )}
        </div>
      </div>
    </MainContainer>
  );
};

export default BookingDetails;
