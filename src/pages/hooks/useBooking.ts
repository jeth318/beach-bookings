import { api } from "~/utils/api";

export const useBooking = () => {
  const { mutate: mutateBooking, isLoading: isLoadingBookingMutation } =
    api.booking.update.useMutation({});

  const { mutate: mutateJoinable, isLoading: isLoadingJoinable } =
    api.booking.updateJoinable.useMutation({});

  return {
    mutateBooking,
    mutateJoinable,
    isLoadingJoinable,
    isLoadingBookingMutation,
  };
};
