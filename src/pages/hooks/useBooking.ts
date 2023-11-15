import { api } from "~/utils/api";

const useBooking = () => {
  const { mutate: mutateBooking, isLoading: isLoadingBookingMutation } =
    api.booking.update.useMutation({});

  const { mutate: mutateJoinable, isLoading: isLoadingJoinable } =
    api.booking.updateJoinable.useMutation({});

  const { data: upcomingBookingsCreated } =
    api.booking.getUpcomingForUser.useQuery();
  const { data: upcomingBookingsJoined } =
    api.booking.getJoinedUpcoming.useQuery();

  const { refetch: refetchBookings, isInitialLoading: isInitialLoadingRefetch } = api.booking.getAll.useQuery(undefined, {
    refetchIntervalInBackground: true,
    refetchInterval: 15000,
  });

  return {
    mutateBooking,
    mutateJoinable,
    isLoadingJoinable,
    isLoadingBookingMutation,
    upcomingBookingsCreated,
    upcomingBookingsJoined,
    refetchBookings,
    isInitialLoadingRefetch
  };
};

export default useBooking;
