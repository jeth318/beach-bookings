import { api } from "~/utils/api";
import { useUser } from "./useUser";

export const useJoinedAssociations = (email: string) => {
  const { user } = useUser(email);
  const { data, isFetched } = api.association.getForUser.useQuery(
    { ids: user?.associations || [] },
    {
      enabled: !!user?.id && !!user?.associations,
    }
  );

  const joinedAssociationsWithoutPublic = data?.filter(
    (association) => association.id === "public"
  );

  const isWithoutGroup = isFetched && !joinedAssociationsWithoutPublic?.length;

  const isMultiGroupMember =
    !!user?.id &&
    joinedAssociationsWithoutPublic?.length &&
    joinedAssociationsWithoutPublic?.length > 1;

  const isOneGroupMember =
    !!user?.id &&
    joinedAssociationsWithoutPublic?.length === 1 &&
    !!joinedAssociationsWithoutPublic[0]?.id !== undefined;

  return {
    joinedAssociations: data,
    joinedAssociationsWithoutPublic,
    hasFetchedJoinedAssociations: isFetched,
    isWithoutGroup,
    isOneGroupMember,
    isMultiGroupMember,
  };
};
