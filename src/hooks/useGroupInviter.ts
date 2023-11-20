import { api } from "~/utils/api";

type Props = {
  enabled?: boolean;
  inviterId?: string;
};

const useGroupInviter = ({ inviterId = "", enabled = true }: Props) => {
  const { data: inviter, isFetched: hasFetchedInviter } =
    api.user.getById.useQuery(
      { id: inviterId },
      {
        refetchOnWindowFocus: false,
        enabled: !!inviterId && enabled,
      }
    );

  return {
    inviter,
    hasFetchedInviter,
  };
};

export default useGroupInviter;
