import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import { GuestPlayers } from "~/components/GuestPlayers";
import MainContainer from "~/components/MainContainer";
import { PageLoader } from "~/components/PageLoader";
import { PlayersTable } from "~/components/PlayersTable";
import { SubHeader } from "~/components/SubHeader";
import useGuest from "~/hooks/useGuest";
import useSingleBooking from "~/hooks/useSingleBooking";
import useSingleFacility from "~/hooks/useSingleFacility";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import { getBgColor } from "~/utils/color.util";
import { getQueryId } from "~/utils/general.util";

const BookingDetails = () => {
  const router = useRouter();
  const session = useSession();
  const bgColorDark = getBgColor(router?.asPath);
  const { booking, isFetchedBooking } = useSingleBooking({
    id: getQueryId(router),
  });
  const { facility, isSingleFacilityFetched } = useSingleFacility({
    facilityId: booking?.facilityId || undefined,
  });
  const { allGuestsInBooking, isGuestFetched } = useGuest({
    bookingId: booking?.id,
  });

  const { usersInBooking } = useUsersInBooking({ booking });

  const usersInBookingCount = usersInBooking?.length
    ? usersInBooking?.length
    : 0;
  const allGuestsInBookingCount = allGuestsInBooking?.length
    ? allGuestsInBooking?.length
    : 0;

  const totalPlayerCount = usersInBookingCount + allGuestsInBookingCount;

  if (session?.status === "unauthenticated") {
    return <ArrogantFrog />;
  }

  if (!isFetchedBooking || !isSingleFacilityFetched || !isGuestFetched) {
    return <PageLoader bgColor={bgColorDark} />;
  }

  if (sessionStorage)
    return (
      <>
        <SubHeader title="Details" />
        <MainContainer bgFrom="2e026d">
          <div className="smooth-render-in container mt-4 max-w-md p-4">
            <div className="mb-4 text-center text-white">
              <h2 className="text-2xl">
                {booking?.date.toLocaleDateString("sv-SE")}
              </h2>
              <div className="rounded-md border border-zinc-400 p-2">
                <div className="mt-2"></div>
                <h4>{facility?.name}</h4>
                <h4>{facility?.address}</h4>
              </div>
            </div>
            <div>{!!booking && <PlayersTable booking={booking} />}</div>

            <div className="mt-8 rounded-md border border-zinc-400 p-2">
              <h2 className="mb-2 mt-2 text-center text-xl text-white">
                Add guest
              </h2>

              <div>
                {!!booking && (
                  <GuestPlayers
                    users={usersInBooking || []}
                    booking={booking}
                  />
                )}
              </div>
              {totalPlayerCount >= 4 ? (
                <h5 className="text-center">
                  No more guests can be added due to the booking already is
                  full.
                </h5>
              ) : (
                <h4 className="mb-2 mt-4 text-center text-white">
                  If you have a friend without an account, or if you are in a
                  hurry, you can add them as a guest.
                </h4>
              )}
            </div>
          </div>
        </MainContainer>
      </>
    );
};

export default BookingDetails;
