import { type NextRouter } from "next/router";
import { api } from "~/utils/api";

const useInvite = (router: NextRouter, email?: string | null | undefined) => {
  const { data: invite, isFetched: hasFetchedInvite } = api.invite.get.useQuery(
    {
      email: email || "",
      associationId: (router.query.id as string) || "",
    },
    {
      refetchOnWindowFocus: false,
      enabled:
        typeof email === "string" && typeof router?.query?.id === "string",
    }
  );

  const { mutate: mutateInviteDelete } = api.invite.delete.useMutation({});

  return {
    invite,
    hasFetchedInvite,
    mutateInviteDelete,
  };
};

export default useInvite;
