import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import { EmailConsents } from "~/components/EmailConsents";
import { PlayerInfo } from "~/components/PlayerInfo";
import { AccountControl } from "~/components/AccountControl";
import useSessionUser from "~/hooks/useSessionUser";

const Settings = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { sessionUser, refetchSessionUser } = useSessionUser();

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  if (sessionStatus === "loading" || !sessionUser?.id) {
    return (
      <>
        <SubHeader title="Settings" />

        <div className="bg-gradient-to-b from-[#255eb3] to-black">
          <PageLoader />
        </div>
      </>
    );
  }

  return (
    <>
      <SubHeader title="Settings" />
      <div className="bg-gradient-to-b from-[#255eb3] to-black">
        <div className="flex justify-center">
          <div className="flex w-full max-w-md flex-col self-center p-4">
            <PlayerInfo user={sessionUser} refetchUser={refetchSessionUser} />
            <hr className="mb-4 mt-6" />
            <EmailConsents />
            <hr className="mb-4 mt-6" />
            <AccountControl />
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
