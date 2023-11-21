import { type Booking } from "@prisma/client";
import { api } from "~/utils/api";

type Props = {
  enabled?: boolean;
  booking?: Booking | undefined | null;
};

const useUsersInBooking = ({ booking }: Props) => {
  const {
    data: usersInBooking,
    isFetched: isUsersInBookingFetched,
    isInitialLoading: isInitialLoadingUsersInBooking,
  } = api.user.getMultipleByIds.useQuery({
    playerIds: booking?.players || [],
  });

  return {
    usersInBooking,
    isUsersInBookingFetched,
    isInitialLoadingUsersInBooking,
  };
};

export default useUsersInBooking;
