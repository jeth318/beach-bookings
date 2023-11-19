import { api } from "~/utils/api";

type Props = {
  id?: string;
};

const useSingleBooking = ({ id }: Props) => {
  const { data: booking, isFetched: isFetchedBooking } =
    api.booking.getSingle.useQuery({ id: id || "" }, { enabled: !!id });
  const {
    mutateAsync: createBooking,
    isLoading: isLoadingCreateBooking,
    isSuccess: isSuccessfullyCreateBooking,
    isError: isErrorCreateBookingJoinable,
  } = api.booking.create.useMutation({});

  const {
    mutateAsync: updateBooking,
    isLoading: isLoadingUpdateBooking,
    isSuccess: isSuccessfullyUpdatedBooking,
  } = api.booking.update.useMutation({});

  const {
    mutateAsync: updateBookingJoinable,
    isLoading: isLoadingUpdateBookingJoinable,
    isSuccess: isSuccessfullyUpdateBookingJoinable,
    isError: isErrorUpdateBookingJoinable,
  } = api.booking.updateJoinable.useMutation({});

  const {
    mutateAsync: deleteBooking,
    isLoading: isLoadingDeleteBookingJoinable,
    isSuccess: isSuccessfullyDeleteBookingJoinable,
    isError: isErrorDeleteBookingJoinable,
  } = api.booking.delete.useMutation({});

  return {
    createBooking,
    updateBooking,
    updateBookingJoinable,
    deleteBooking,
    booking,
    isFetchedBooking,
    isLoadingCreateBooking,
    isSuccessfullyCreateBooking,
    isErrorCreateBookingJoinable,
    isLoadingUpdateBooking,
    isSuccessfullyUpdatedBooking,
    isLoadingUpdateBookingJoinable,
    isSuccessfullyUpdateBookingJoinable,
    isErrorUpdateBookingJoinable,
    isLoadingDeleteBookingJoinable,
    isSuccessfullyDeleteBookingJoinable,
    isErrorDeleteBookingJoinable,
  };
};

export default useSingleBooking;
