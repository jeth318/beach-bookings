import { type Booking } from "@prisma/client";
import { api } from "~/utils/api";

export const useUser = (
  email: string,
  enabled?: boolean,
  booking?: Booking
) => {
  const {
    data: user,
    isFetched: isUserFetched,
    isError: isUserError,
    isLoading: isUserLoading,
  } = api.user.getSingle.useQuery({ email: email }, { enabled: enabled });

  const { data: usersInBooking, isFetched: hasFetchedUsersInBooking } =
    api.user.getMultipleByIds.useQuery({
      playerIds: booking?.players || [],
    });

  return {
    user,
    isUserFetched,
    isUserError,
    isUserLoading,
    usersInBooking,
    hasFetchedUsersInBooking,
  };
};
