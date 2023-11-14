import { api } from "~/utils/api";

export const useEmail = () => {
  const { mutate: mutateEmail } = api.emailer.sendEmail.useMutation();
  const { mutate: mutateInviteEmail } =
    api.emailer.sendInvitationEmail.useMutation();

  return {
    mutateEmail,
    mutateInviteEmail,
  };
};
