import { api } from "~/utils/api";

const useSessionUser = () => {
  const {
    data: sessionUser = undefined,
    isFetched: hasFetchedSessionUser,
    isError: isSessionUserError,
    isLoading: isSessionUserLoading,
  } = api.user.get.useQuery();

  return {
    sessionUser,
    hasFetchedSessionUser,
    isSessionUserError,
    isSessionUserLoading,
  };
};

export default useSessionUser;
