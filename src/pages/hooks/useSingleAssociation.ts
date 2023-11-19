import { api } from "~/utils/api";

type Props = {
  associationId?: string;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
};
const useSingleAssociation = ({
  associationId,
  refetchOnMount = true,
  refetchOnWindowFocus = true,
}: Props) => {
  const {
    data,
    isFetched: isSingleAssociationFetched,
    isSuccess: isSingleAssociationSuccess,
    isError: isSingleAssociationError,
  } = api.association.getSingle.useQuery(
    { id: associationId || "" },
    {
      enabled: !!associationId,
      refetchOnMount,
      refetchOnWindowFocus,
    }
  );

  return {
    association: data,
    isSingleAssociationSuccess,
    isSingleAssociationError,
    isSingleAssociationFetched,
  };
};

export default useSingleAssociation;
