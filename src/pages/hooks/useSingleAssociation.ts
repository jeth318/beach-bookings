import { type NextRouter } from "next/router";
import { api } from "~/utils/api";

export const useSingleAssociations = (router: NextRouter) => {
  const { data, isFetched } = api.association.getSingle.useQuery(
    { id: typeof router?.query.id === "string" ? router?.query.id : "" },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );

  return {
    association: data,
    hasFetchedSingleAssociation: isFetched,
  };
};
