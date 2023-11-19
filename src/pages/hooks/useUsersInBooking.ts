import { type Booking } from "@prisma/client";
import { api } from "~/utils/api";

type Props = {
  enabled?: boolean;
  booking?: Booking;
};

const useUsersInBooking = ({ booking }: Props) => {
  const {
    data: usersInBooking,
    isFetched: hasFetchedUsersInBooking,
    isInitialLoading: isInitialLoadingUsersInBooking,
  } = api.user.getMultipleByIds.useQuery({
    playerIds: booking?.players || [],
  });

  return {
    usersInBooking,
    hasFetchedUsersInBooking,
    isInitialLoadingUsersInBooking,
  };
};

export default useUsersInBooking;
