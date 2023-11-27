import { useSession } from "next-auth/react";
import { api } from "~/utils/api";

const useSessionUser = () => {
  const session = useSession();
  const {
    data: sessionUser = undefined,
    isFetched: hasFetchedSessionUser,
    isError: isSessionUserError,
    isLoading: isSessionUserLoading,
  } = api.user.get.useQuery(undefined, {
    enabled: !!session.data?.user.id,
  });

  return {
    sessionUser,
    hasFetchedSessionUser,
    isSessionUserError,
    isSessionUserLoading,
  };
};

export default useSessionUser;
