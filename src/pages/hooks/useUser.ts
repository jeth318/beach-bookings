import { api } from "~/utils/api";

type Props = {
  email?: string | null | undefined;
  enabled?: boolean;
};

const useUser = ({ email = "", enabled }: Props) => {
  const {
    data: user,
    isFetched: hasFetchedUser,
    isSuccess: isUserSuccess,
    isError: isUserError,
    refetch: refetchUser,
    isLoading: isUserLoading,
  } = api.user.getSingle.useQuery({ email: email || "" }, { enabled: enabled });

  const { mutateAsync: updateUserAssociations } =
    api.user.updateAssociations.useMutation();

  return {
    user,
    hasFetchedUser,
    isUserError,
    isUserSuccess,
    isUserLoading,
    refetchUser,
    updateUserAssociations,
  };
};

export default useUser;
