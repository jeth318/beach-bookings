import { api } from "~/utils/api";

export const useUser = (email: string, enabled?: boolean) => {
  const { data, isFetched, isError, isLoading } = api.user.getSingle.useQuery(
    { email: email },
    { enabled: enabled }
  );

  return {
    user: data,
    isUserFetched: isFetched,
    isUserError: isError,
    isUserLoading: isLoading,
  };
};
