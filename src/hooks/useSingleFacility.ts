import { api } from "~/utils/api";

type Props = {
  facilityId?: string;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
};
const useSingleFacility = ({
  facilityId,
  refetchOnMount = true,
  refetchOnWindowFocus = true,
}: Props) => {
  const {
    data,
    isFetched: isSingleFacilityFetched,
    isSuccess: isSingleFacilitySuccess,
    isError: isSingleFacilityError,
  } = api.facility.getSingle.useQuery(
    { id: facilityId || "" },
    {
      enabled: !!facilityId,
      refetchOnMount,
      refetchOnWindowFocus,
    }
  );

  const { mutateAsync: updateFacility, isLoading: isLoadingUpdateFacility } =
    api.facility.update.useMutation();

  return {
    facility: data,
    updateFacility,
    isLoadingUpdateFacility,
    isSingleFacilitySuccess,
    isSingleFacilityError,
    isSingleFacilityFetched,
  };
};

export default useSingleFacility;
