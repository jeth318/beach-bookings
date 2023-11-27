import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

type Props = {
  id?: string | null | undefined;
  bookingId?: string;
};

const useGuest = ({ id = "", bookingId = "" }: Props) => {
  const session = useSession();
  const {
    data: guest,
    isFetched: isGuestFetched,
    isSuccess: isGuestSuccess,
    isError: isGuestError,
    refetch: refetchGuest,
    isLoading: isGuestLoading,
  } = api.guest.get.useQuery(
    { id: id || "" },
    { enabled: !!session.data?.user.id }
  );
  const { mutateAsync: updateGuest } = api.guest.update.useMutation();

  const { mutateAsync: deleteGuest } = api.guest.delete.useMutation();
  const { mutateAsync: createGuest } = api.guest.create.useMutation();

  const {
    data: allGuestsInBooking,
    isFetched: isAllGuestsInBookingFetched,
    refetch: refetchAllGuestsInBooking,
  } = api.guest.getAllInBooking.useQuery(
    {
      bookingId,
    },
    { enabled: !!bookingId }
  );

  const { data: allGuests, refetch: refetchAllGuests } =
    api.guest.getAll.useQuery(undefined, {
      enabled: !!session.data?.user.id,
    });

  return {
    guest,
    isGuestFetched,
    isAllGuestsInBookingFetched,
    isGuestError,
    isGuestSuccess,
    isGuestLoading,
    refetchAllGuestsInBooking,
    allGuestsInBooking,
    allGuests,
    refetchAllGuests,
    refetchGuest,
    createGuest,
    deleteGuest,
    updateGuest,
  };
};

export default useGuest;
