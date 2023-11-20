import { api } from "~/utils/api";

type Props = {
  email?: string | null | undefined;
  enabled?: boolean;
};

const useUser = ({ email = "", enabled }: Props) => {
  const {
    data: user,
    isFetched: isUserFetched,
    isSuccess: isUserSuccess,
    isError: isUserError,
    refetch: refetchUser,
    isLoading: isUserLoading,
  } = api.user.getSingle.useQuery({ email: email || "" }, { enabled: enabled });

  const { mutateAsync: updateUserAssociations } =
    api.user.updateAssociations.useMutation();

  const { mutateAsync: deleteUser } = api.user.delete.useMutation();

  return {
    user,
    isUserFetched,
    isUserError,
    isUserSuccess,
    isUserLoading,
    refetchUser,
    deleteUser,
    updateUserAssociations,
  };
};

export default useUser;
