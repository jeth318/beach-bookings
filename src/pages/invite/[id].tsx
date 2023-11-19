import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { PlayerInfo } from "~/components/PlayerInfo";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import useInvite from "../hooks/useInvite";
import useUser from "../hooks/useUser";
import useGroupInviter from "../hooks/useGroupInviter";
import useSessionUser from "../hooks/useSessionUser";
import useSingleAssociation from "../hooks/useSingleAssociation";

const Invite = () => {
  const [isAcceptingInvite, setIsAcceptingInvite] = useState<boolean>(false);

  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { sessionUser } = useSessionUser();
  const associationId =
    typeof router.query?.id === "string" ? router.query?.id : undefined;
  const email = sessionUser?.email;
  const { user, hasFetchedUser, updateUserAssociations, refetchUser } = useUser(
    { email }
  );

  const { invite, deleteInvite, hasFetchedInvite } = useInvite({
    email,
    associationId,
  });

  const inviterId = invite?.invitedBy;
  const { inviter } = useGroupInviter({ inviterId });
  const { association, isSingleAssociationFetched } = useSingleAssociation({
    associationId,
  });

  const getUserAssociations = (user: {
    id: string;
    name: string | null;
    associations: string[];
  }) =>
    !!user?.associations.length
      ? ([...user?.associations, association?.id] as string[])
      : ([association?.id] as string[]);

  const onJoinConfirmed = async () => {
    if (!association?.id || !user?.associations?.includes(association?.id)) {
      return null;
    }

    setIsAcceptingInvite(true);
    const associations = getUserAssociations(user);

    try {
      await updateUserAssociations({ associations });
      void router.push(`/association/${association.id}`);
      invite?.id && deleteInvite({ id: invite?.id });
    } catch (error) {
      console.error("There was an error joining the group.");
    }
    setIsAcceptingInvite(false);
  };

  if (sessionStatus === "loading") {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#a31da1] to-[#000000]"}
      />
    );
  }

  if (sessionStatus === "unauthenticated") {
    void signIn();
    return null;
  }

  if (
    sessionStatus === "authenticated" &&
    hasFetchedInvite &&
    invite === null
  ) {
    return <ArrogantFrog />;
  }

  if (!isSingleAssociationFetched || !hasFetchedUser || !hasFetchedInvite) {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#a31da1] to-[#000000]"}
      />
    );
  }

  if (
    invite?.associationId &&
    user?.associations?.includes(String(invite?.associationId))
  ) {
    void router.push(`/association/${invite.associationId}`);
    return null;
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col text-white">
      <SubHeader title="Invitation" />
      <div
        className={`smooth-render-in bookings-container flex min-h-[400px] flex-col items-center justify-center bg-gradient-to-b from-[#a31da1] to-[#000000]`}
      >
        <div className="mt-4 flex flex-col items-center justify-center">
          <h4>
            {inviter?.name || "A player"} has invited you to join their group{" "}
          </h4>
          <h2 className="text-2xl">{association?.name}</h2>

          {user && !user?.name && hasFetchedUser && (
            <div className="m-4">
              <div className="stack">
                <div className="card-compact card mb-4 bg-primary text-primary-content shadow-md">
                  <div className="card-body">
                    <p>
                      Before you can accept the invite, please submit your name
                      (you can edit this later in settings).
                    </p>
                  </div>
                </div>
              </div>
              {sessionUser && (
                <PlayerInfo
                  user={sessionUser}
                  hideTitle
                  hidePhone
                  hideEmail
                  refetchUser={refetchUser}
                />
              )}
            </div>
          )}
          {user?.name && (
            <div className="mb-4 mt-4 flex flex-col items-center">
              <button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={onJoinConfirmed}
                disabled={isAcceptingInvite || !user?.name}
                className={`btn btn-primary ${
                  !!user?.name ? "animate-pulse" : ""
                } text-white`}
              >
                Accept invite
              </button>
              {isAcceptingInvite ? (
                <BeatLoader className="mt-2" color="white" size={15} />
              ) : (
                <div className="h-[27px]"></div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Invite;
