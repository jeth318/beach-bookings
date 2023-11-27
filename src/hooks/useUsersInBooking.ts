import { type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";
import { unique } from "next/dist/build/utils";
import { api } from "~/utils/api";

type Props = {
  enabled?: boolean;
  booking?: Booking | undefined | null;
};

const useUsersInBooking = ({ booking }: Props) => {
  const session = useSession();
  const {
    data: usersInBooking,
    isFetched: isUsersInBookingFetched,
    isInitialLoading: isInitialLoadingUsersInBooking,
  } = api.user.getMultipleByIds.useQuery(
    {
      playerIds: booking?.players || [],
    },
    {
      enabled: !!session.data?.user.id,
    }
  );

  return {
    usersInBooking,
    isUsersInBookingFetched,
    isInitialLoadingUsersInBooking,
  };
};

export default useUsersInBooking;
