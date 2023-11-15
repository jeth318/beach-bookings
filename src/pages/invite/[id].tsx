import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { PlayerInfo } from "~/components/PlayerInfo";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import useInvite from "../hooks/useInvite";
import useAssociations from "../hooks/useAssociations";
import useUser from "../hooks/useUser";

const Invite = () => {
  const router = useRouter();
  const [isAcceptingInvite, setIsAcceptingInvite] = useState<boolean>(false);
  const { status: sessionStatus, data: sessionData } = useSession();
  const email = sessionData?.user.email || "";

  const {
    user,
    sessionUser,
    refetchUser,
    hasFetchedUser,
    inviter,
    hasFetchedInviter,
  } = useUser(sessionData?.user.email || "");

  const { invite, mutateInviteDelete, hasFetchedInvite } = useInvite(
    router,
    email
  );

  const { singleAssociation, hasFetchedSingleAssociation } =
    useAssociations(email);

  const { mutate: mutateUserAssociations } =
    api.user.updateAssociations.useMutation();

  const onJoinConfirmed = () => {
    if (
      singleAssociation?.id &&
      !user?.associations?.includes(singleAssociation?.id)
    ) {
      setIsAcceptingInvite(true);
      const updatedAssociationList = !!user?.associations.length
        ? [...user?.associations, singleAssociation.id]
        : [singleAssociation.id];
      mutateUserAssociations(
        {
          associations: updatedAssociationList,
        },
        {
          onSuccess: () => {
            void router.push(`/association/${singleAssociation.id}`);
            invite?.id && mutateInviteDelete({ id: invite?.id });
          },
          onError: () => {
            setIsAcceptingInvite(false);
          },
        }
      );
    }
  };

  console.log({ sessionStatus });

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

  if (
    !hasFetchedSingleAssociation ||
    !hasFetchedUser ||
    !hasFetchedInviter ||
    !hasFetchedInvite
  ) {
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
          <h2 className="text-2xl">{singleAssociation?.name}</h2>

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
