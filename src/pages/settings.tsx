import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import { EmailConsents } from "~/components/EmailConsents";
import { PlayerInfo } from "~/components/PlayerInfo";
import { AccountControl } from "~/components/AccountControl";
import MainContainer from "~/components/MainContainer";
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
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#01797391] to-[#000000]"}
      />
    );
  }

  return (
    <>
      <SubHeader title="Settings" />
      <MainContainer bgFrom="01797391" heightType="h-full">
        <div className="flex justify-center">
          <div className="smooth-render-in container flex w-full max-w-md flex-col self-center p-4">
            <PlayerInfo user={sessionUser} refetchUser={refetchSessionUser} />
            <hr className="mb-4 mt-6" />
            <EmailConsents />
            <hr className="mb-4 mt-6" />
            <AccountControl />
          </div>
        </div>
      </MainContainer>
    </>
  );
};

export default Settings;
