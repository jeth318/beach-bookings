import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

const useSessionUser = () => {
  const { status } = useSession();
  const {
    data: sessionUser = undefined,
    isFetched: hasFetchedSessionUser,
    refetch: refetchSessionUser,
    isError: isSessionUserError,
    isLoading: isSessionUserLoading,
  } = api.user.get.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  return {
    sessionUser,
    refetchSessionUser,
    hasFetchedSessionUser,
    isSessionUserError,
    isSessionUserLoading,
  };
};

export default useSessionUser;
