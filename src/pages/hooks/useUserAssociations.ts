import { api } from "~/utils/api";

type Props = {
  associationIds?: string[];
};

const useUserAssociations = ({ associationIds }: Props) => {
  const { data: joinedAssociations, isFetched: isJoinedAssociationsFetched } =
    api.association.getMultipleByIds.useQuery(
      { ids: associationIds || [] },
      {
        enabled: !associationIds?.length,
      }
    );

  const isWithoutGroup =
    isJoinedAssociationsFetched && !joinedAssociations?.length;
  const isMultiGroupMember =
    joinedAssociations && joinedAssociations?.length > 1;
  const isOneGroupMember =
    joinedAssociations?.length === 1 &&
    !!joinedAssociations[0]?.id !== undefined;

  const { mutateAsync: createAssociationMutation } =
    api.association.create.useMutation();

  return {
    joinedAssociations,
    isJoinedAssociationsFetched,
    isWithoutGroup,
    isOneGroupMember,
    isMultiGroupMember,
    createAssociationMutation,
  };
};

export default useUserAssociations;