import { useRouter } from "next/router";
import { useState } from "react";
import { GuestPlayers } from "~/components/GuestPlayers";
import { PageLoader } from "~/components/PageLoader";
import { PlayersTable } from "~/components/PlayersTable";
import useGuest from "~/hooks/useGuest";
import useSingleBooking from "~/hooks/useSingleBooking";
import useSingleFacility from "~/hooks/useSingleFacility";
import { getQueryId } from "~/utils/general.util";

const BookingDetails = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const { booking, isFetchedBooking } = useSingleBooking({
    id: getQueryId(router),
  });
  const { facility, isSingleFacilityFetched } = useSingleFacility({
    facilityId: booking?.facilityId || undefined,
  });
  const { allGuestsInBooking, isGuestFetched } = useGuest({
    bookingId: booking?.id,
  });
  const guestPlayersCount =
    (allGuestsInBooking?.length && Number(allGuestsInBooking?.length)) || 0;
  const playersCount = booking?.players?.length || 0;

  const isFull = booking?.maxPlayers === playersCount + guestPlayersCount;

  if (!isFetchedBooking || !isSingleFacilityFetched || !isGuestFetched) {
    return <PageLoader bgColor="" />;
  }
  return (
    <main className="min-w-sm pd-3 flex h-full min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="smooth-render-in container max-w-md p-4">
        <div className="mb-4 text-center text-white">
          <h2 className="text-2xl">
            {booking?.date.toLocaleDateString("sv-SE")}
          </h2>
          <h4>{booking?.date.toLocaleTimeString("sv-SE")}</h4>
          <h4>{facility?.name}</h4>
        </div>
        <h2 className="mt-4 text-center text-xl">Players</h2>
        <div>
          {!!booking && (
            <PlayersTable guests={allGuestsInBooking} booking={booking} />
          )}
        </div>

        <div className="mt-8 rounded-md border border-zinc-400 p-2">
          <h2 className="mt-4 text-center text-xl">Guest players +</h2>
          <h4 className="mb-6 text-center">
            Make sure to keep your guests informed since they wont receive email
            notifications like regular players. If you have added guests and
            must leave the booking yourself, your guests will remain until you
            remove them.
          </h4>

          <div>{!!booking && <GuestPlayers booking={booking} />}</div>
        </div>
      </div>
    </main>
  );
};

export default BookingDetails;
