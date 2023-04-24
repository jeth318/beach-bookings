import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { serverSideHelpers } from "~/utils/staticPropsUtil";
import { PageLoader } from "~/components/PageLoader";

export async function getStaticProps() {
  await serverSideHelpers.association.getAll.prefetch();
  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const Groups = () => {
  const router = useRouter();
  const { status: sessionStatus, data: sessionData } = useSession();
  const associationsQuery = api.association.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (associationsQuery.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>;
  }
  const { data: associations } = associationsQuery;

  const joinedAssociations = associations.filter((item) =>
    sessionData?.user?.id ? item.members.includes(sessionData?.user?.id) : []
  );

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  if (sessionStatus === "loading") {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#005e1ba6] to-[#000000]"}
      />
    );
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col">
      <SubHeader title="Groups" />
      <div>
        <h2>My groups</h2>
        {joinedAssociations.map((item) => {
          return <div key={item.id}>{item.name}</div>;
        })}
      </div>

      <div>
        <h3>All</h3>
        {associations
          .filter(
            (item) =>
              sessionData?.user?.id &&
              !item.members?.includes(sessionData?.user?.id)
          )
          .map((item) => {
            return <div key={item.id}>{item.name}</div>;
          })}
      </div>
    </main>
  );
};

export default Groups;
