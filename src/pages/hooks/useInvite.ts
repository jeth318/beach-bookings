import { type NextRouter } from "next/router";
import { api } from "~/utils/api";

type Props = {
  associationId?: string;
  email?: string | null | undefined;
};

const useInvite = ({ associationId, email }: Props) => {
  const { data: invite, isFetched: hasFetchedInvite } = api.invite.get.useQuery(
    {
      email: email || "",
      associationId: associationId || "",
    },
    {
      refetchOnWindowFocus: false,
      enabled: !!email,
    }
  );

  const { mutate: deleteInvite, isSuccess: successfulDeletion } =
    api.invite.delete.useMutation({});
  const { mutate: createInvite, isLoading: isLoadingInviteCreate } =
    api.invite.create.useMutation({});

  return {
    invite,
    hasFetchedInvite,
    deleteInvite,
    createInvite,
    successfulDeletion,
    isLoadingInviteCreate,
  };
};

export default useInvite;
