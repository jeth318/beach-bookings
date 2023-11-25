import { useRouter } from "next/router";
import { GuestPlayers } from "~/components/GuestPlayers";
import { PlayersTable } from "~/components/PlayersTable";
import useGuest from "~/hooks/useGuest";
import useSingleBooking from "~/hooks/useSingleBooking";
import useSingleFacility from "~/hooks/useSingleFacility";
import { getQueryId } from "~/utils/general.util";

const BookingDetails = () => {
  const router = useRouter();
  const { booking } = useSingleBooking({ id: getQueryId(router) });
  const { facility } = useSingleFacility({
    facilityId: booking?.facilityId || undefined,
  });

  const {
    createGuest,
    refetchAllGuestsInBooking,
    deleteGuest,
    allGuestsInBooking,
  } = useGuest({
    bookingId: booking?.id,
  });

  const onAddGuestClicked = async (guestName: string) => {
    if (!booking?.id) {
      return null;
    }
    await createGuest({ bookingId: booking?.id, name: guestName || "" });
    await refetchAllGuestsInBooking();
  };

  const onKickGuestClicked = async (id: string) => {
    if (!id) {
      return null;
    }
    await deleteGuest({ id });
    await refetchAllGuestsInBooking();
  };

  return (
    <main className="min-w-sm pd-3 flex h-screen min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="smooth-render-in container max-w-md p-4">
        <div className="mb-4 text-center text-white">
          <h2 className="text-2xl">
            {booking?.date.toLocaleDateString("sv-SE")}
          </h2>
          <h4>{booking?.date.toLocaleTimeString("sv-SE")}</h4>
          <h4>{facility?.name}</h4>
        </div>
        <h2 className="mt-4 text-center text-xl">Players</h2>
        <div>{!!booking && <PlayersTable booking={booking} />}</div>
        <h2 className="mt-4 text-center text-xl">Guest players</h2>

        <div>
          {!!booking && (
            <GuestPlayers
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onGuestAdded={onAddGuestClicked}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onGuestKicked={onKickGuestClicked}
              guests={allGuestsInBooking}
              booking={booking}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default BookingDetails;
