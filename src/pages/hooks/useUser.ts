import { type Booking } from "@prisma/client";
import { api } from "~/utils/api";

export const useUser = (
  email?: string,
  enabled?: boolean,
  booking?: Booking,
  inviterId?: string
) => {
  const {
    data: user,
    isFetched: hasFetchedUser,
    isError: isUserError,
    refetch: refetchUser,
    isLoading: isUserLoading,
  } = api.user.getSingle.useQuery({ email: email || "" }, { enabled: enabled });

  const {
    data: sessionUser = undefined,
    isFetched: hasFetchedSessionUser,
    isError: isSessionUserError,
    isLoading: isSessionUserLoading,
  } = api.user.get.useQuery();

  const {
    data: usersInBooking,
    isFetched: hasFetchedUsersInBooking,
    isInitialLoading: isInitialLoadingUsersInBooking,
  } = api.user.getMultipleByIds.useQuery({
    playerIds: booking?.players || [],
  });

  const { data: inviter, isFetched: hasFetchedInviter } =
    api.user.getById.useQuery(
      {
        id: (inviterId as string) || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: !!inviterId,
      }
    );

  const { mutate: mutateUserDelete } = api.user.delete.useMutation();

  return {
    user,
    sessionUser,
    hasFetchedSessionUser,
    isSessionUserError,
    isSessionUserLoading,
    hasFetchedUser,
    isUserError,
    isUserLoading,
    usersInBooking,
    hasFetchedUsersInBooking,
    isInitialLoadingUsersInBooking,
    refetchUser,
    mutateUserDelete,
    inviter,
    hasFetchedInviter,
  };
};
