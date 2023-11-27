import { Session } from "inspector";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

const useBooking = () => {
  const session = useSession();
  const { mutate: mutateBooking, isLoading: isLoadingBookingMutation } =
    api.booking.update.useMutation({});

  const { mutate: mutateJoinable, isLoading: isLoadingJoinable } =
    api.booking.updateJoinable.useMutation({});

  const { data: upcomingBookingsCreated } =
    api.booking.getUpcomingForUser.useQuery(undefined, {
      enabled: !!session.data?.user.id,
    });
  const { data: upcomingBookingsJoined } =
    api.booking.getJoinedUpcoming.useQuery(undefined, {
      enabled: !!session.data?.user.id,
    });

  const {
    refetch: refetchBookings,
    isInitialLoading: isInitialLoadingRefetch,
  } = api.booking.getAll.useQuery(undefined, {
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
    isInitialLoadingRefetch,
  };
};

export default useBooking;
