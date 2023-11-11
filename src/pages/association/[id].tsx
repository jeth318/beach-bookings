import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import { useState } from "react";

const Group = () => {
  const router = useRouter();
  const { status: sessionStatus, data: sessionData } = useSession();
  const { data: association, status } = api.association.getSingle.useQuery(
    { id: typeof router?.query?.id === "string" ? router?.query?.id : "" },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [searchPlayerValue, setSearchPlayerValue] = useState<
    string | undefined
  >(undefined);
  const { data: userSearchResult } = api.user.getSingle.useQuery(
    {
      email: searchQuery || "",
    },
    { enabled: !!searchQuery && searchQuery.length > 2 }
  );

  const { data: members } = api.user.getGroupUsersByIds.useQuery({
    playerIds: association?.members || null,
  });

  const { mutate: createInvite } = api.invite.create.useMutation({});

  console.log({ userSearchResult });

  const onSearchClicked = () => {
    setSearchQuery(searchPlayerValue?.trim());

    if (searchQuery?.length && typeof router.query.id === "string") {
      createInvite({
        email: searchQuery,
        associationId: router.query.id,
      });
    }
    return null;
  };

  if (status !== "success") {
    // won't happen since we're using `fallback: "blocking"`

    return <>FAILLoading...</>;
  }

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

  if (!association) {
    return null;
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col">
      <SubHeader title="Groups" />
      <div className="mt-8">
        <h2 className="heading text-3xl">{association.name}</h2>
        <h4>{association.description}</h4>
      </div>

      <div className="text-lg">Add a player to this group</div>
      {searchQuery}
      <p>RESULTS: {userSearchResult?.name}</p>

      {userSearchResult === null &&
        "No user found with that eemail. Click here to invite player"}

      <div className="form-control">
        <div className="input-group">
          <input
            type="text"
            placeholder="Search…"
            value={searchPlayerValue}
            onChange={(e) => setSearchPlayerValue(e.target.value)}
            className="input-bordered input"
          />
          <button className="btn-square btn" onClick={onSearchClicked}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <h4 className="">Members</h4>
      <div>
        {members?.map((member) => {
          return <div key={member.id}>{member?.name}</div>;
        })}
      </div>
    </main>
  );
};

export default Group;
