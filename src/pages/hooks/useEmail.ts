import { api } from "~/utils/api";

const useEmail = () => {
  const { mutate: sendEmail } = api.emailer.sendEmail.useMutation();
  const { mutate: sendInvitationEmail } =
    api.emailer.sendInvitationEmail.useMutation();

  return {
    sendEmail,
    sendInvitationEmail,
  };
};

export default useEmail;
