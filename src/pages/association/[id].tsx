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

  const { data: members } = api.user.getUsersByAssociationId.useQuery({
    associationId: association?.id || "",
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
        bgColor={"bg-gradient-to-b from-[#a31da1] to-[#000000]"}
      />
    );
  }

  if (!association) {
    return null;
  }

  return (
    <>
      <SubHeader title={association.name} />
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c] text-white">
        <div className="mb-4 mt-8 flex flex-col justify-center">
          <h2 className="heading text-center text-3xl ">{association.name}</h2>
          <h4 className="">{association.description}</h4>
        </div>
        <div className=" text-lg">Invite to group</div>
        {searchQuery}
        <div className="form-control">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter email"
              value={searchPlayerValue}
              onChange={(e) => setSearchPlayerValue(e.target.value)}
              className="input-bordered input text-black"
            />
            <button className="btn" onClick={onSearchClicked}>
              INVITE
            </button>
          </div>
        </div>

        <div className="mb-8 mt-8 w-[100%] max-w-md overflow-x-auto pl-2 pr-2">
          <table className="table-zebra table-compact table w-[100%] text-black">
            {/* head */}
            <thead>
              <tr>
                <th colSpan={3}>Members</th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {members?.map((member) => {
                return (
                  <tr key={member.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            <img
                              src={member.image || "/user-default.png"}
                              alt="Avatar Tailwind CSS Component"
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {member.name}
                      <br />
                      <span className="badge-ghost badge badge-sm">
                        Series 7
                      </span>
                    </td>
                    <th>
                      <button className="btn-ghost btn-xs btn">details</button>
                    </th>
                  </tr>
                );
              })}
            </tbody>
            {/* foot */}
            <tfoot>
              <tr>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </main>
    </>
  );
};

export default Group;
