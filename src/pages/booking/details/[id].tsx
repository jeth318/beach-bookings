import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import { GuestPlayers } from "~/components/GuestPlayers";
import { PageLoader } from "~/components/PageLoader";
import { PlayersTable } from "~/components/PlayersTable";
import useGuest from "~/hooks/useGuest";
import useSingleBooking from "~/hooks/useSingleBooking";
import useSingleFacility from "~/hooks/useSingleFacility";
import useUsersInBooking from "~/hooks/useUsersInBooking";
import { getBgColor } from "~/utils/color.util";
import { getQueryId } from "~/utils/general.util";


type UserInBooking = {
  id: string;
  emailConsents: string[];
  name: string | null;
  image: string | null;
};

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

  if (session?.status === "unauthenticated") {
    return <ArrogantFrog />;
  }

  if (!isFetchedBooking || !isSingleFacilityFetched || !isGuestFetched) {
    return <PageLoader bgColor={bgColorDark} />;
  }

  if (sessionStorage)
    return (
      <main className="min-w-sm pd-3 flex h-full min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="smooth-render-in container max-w-md p-4">
          <div className="mb-4 text-center text-white">
            <h2 className="text-2xl">
              {booking?.date.toLocaleDateString("sv-SE")}
            </h2>
            {/*             <h4>{booking?.date.toLocaleTimeString("sv-SE")}</h4>
            <div className="mt-2"></div>
            <h4>{facility?.name}</h4>
            <h4>{facility?.address}</h4> */}
          </div>
          <div>
            {!!booking && (
              <PlayersTable guests={allGuestsInBooking} booking={booking} />
            )}
          </div>

          <div className="mt-8 rounded-md border border-zinc-400 p-2">
            <h2 className="mb-2 mt-2 text-center text-xl text-white">
              My guests
            </h2>

            <div>
              {!!booking && (
                <GuestPlayers users={usersInBooking} booking={booking} />
              )}
            </div>
            <h4 className="mb-2 mt-4 text-center text-white">
              If you have a friend without an account, or if you are in a hurry,
              you can add them as a guest.
            </h4>
          </div>
        </div>
      </main>
    );
};

export default BookingDetails;
