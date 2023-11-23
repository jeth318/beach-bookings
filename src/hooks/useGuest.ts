import { api } from "~/utils/api";

type Props = {
  id?: string | null | undefined;
  bookingId?: string;
};

const useGuest = ({ id = "", bookingId = "" }: Props) => {
  const {
    data: guest,
    isFetched: isGuestFetched,
    isSuccess: isGuestSuccess,
    isError: isGuestError,
    refetch: refetchGuest,
    isLoading: isGuestLoading,
  } = api.guest.get.useQuery({ id: id || "" });

  const { mutateAsync: updateGuest } = api.guest.update.useMutation();

  const { mutateAsync: deleteGuest } = api.guest.delete.useMutation();
  const { mutateAsync: createGuest } = api.guest.create.useMutation();
  const { data: allGuestsInBooking, refetch: refetchAllGuestsInBooking } =
    api.guest.getAllInBooking.useQuery(
      {
        bookingId,
      },
      { enabled: !!bookingId }
    );

  const { data: allGuests, refetch: refetchAllGuests } =
    api.guest.getAll.useQuery();

  return {
    guest,
    isGuestFetched,
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
