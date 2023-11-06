import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { serverSideHelpers } from "~/utils/staticPropsUtil";
import { PageLoader } from "~/components/PageLoader";
import { EmailConsents } from "~/components/EmailConsents";
import { PlayerInfo } from "~/components/PlayerInfo";
import { AccountControl } from "~/components/AccountControl";

export async function getStaticProps() {
  await serverSideHelpers.booking.getAll.prefetch();
  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const Settings = () => {
  const router = useRouter();
  const { data: user, isFetched: isUserFetched } = api.user.get.useQuery();
  const { status: sessionStatus } = useSession();
  const bookingsQuery = api.booking.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (bookingsQuery.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>;
  }

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  if (sessionStatus === "loading" || !isUserFetched || !user) {
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

      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#01797391] to-[#000000]">
        <div className="smooth-render-in container max-w-md p-4">
          <PlayerInfo user={user} />
          <EmailConsents />
          <AccountControl />
        </div>
      </main>
    </>
  );
};

export default Settings;
