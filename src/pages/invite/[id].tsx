import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import { type User } from "@prisma/client";
import { useState } from "react";
import { BeatLoader } from "react-spinners";
import { PlayerInfo } from "~/components/PlayerInfo";
import { ArrogantFrog } from "~/components/ArrogantFrog";

const Invite = () => {
  const router = useRouter();
  const [isAcceptingInvite, setIsAcceptingInvite] = useState<boolean>(false);
  const { status: sessionStatus, data: sessionData } = useSession();
  const { data: invite, isFetched: hasFetchedInvite } = api.invite.get.useQuery(
    {
      email: sessionData?.user.email || "",
      associationId: (router.query.id as string) || "",
    },
    {
      refetchOnWindowFocus: false,
      enabled:
        typeof sessionData?.user.email === "string" &&
        typeof router?.query?.id === "string",
    }
  );

  const { mutate: mutateInviteDelete } = api.invite.delete.useMutation({});

  const { data: association, isFetched: hasFetchedAssociation } =
    api.association.getSingle.useQuery(
      {
        id: (router.query.id as string) || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: !!invite,
      }
    );

  const { data: inviter, isFetched: hasFetchedInviter } =
    api.user.getById.useQuery(
      {
        id: (invite?.invitedBy as string) || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: !!association && !!invite,
      }
    );

  const {
    data: user,
    isFetched: hasFetchedUser,
    refetch: refetchUser,
  } = api.user.get.useQuery(undefined, {
    refetchOnWindowFocus: false,
    enabled: !!sessionData?.user,
  });

  const { mutate: mutateUserAssociations } =
    api.user.updateAssociations.useMutation();

  const onJoinConfirmed = () => {
    if (association?.id && !user?.associations?.includes(association?.id)) {
      setIsAcceptingInvite(true);
      const updatedAssociationList = !!user?.associations.length
        ? [...user?.associations, association.id]
        : [association.id];
      mutateUserAssociations(
        {
          associations: updatedAssociationList,
        },
        {
          onSuccess: (mutatedUser: User) => {
            console.log("SUCCESSFULLY UPDATED ASSO", mutatedUser.associations);
            void router.push(`/association/${association.id}`);
            invite?.id && mutateInviteDelete({ id: invite?.id });
          },
          onError: () => {
            setIsAcceptingInvite(false);
          },
        }
      );
    }
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

  if (hasFetchedInvite && invite === null) {
    return <ArrogantFrog />;
  }

  if (
    !hasFetchedAssociation ||
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
              <PlayerInfo
                user={user}
                hideTitle
                hidePhone
                hideEmail
                refetchUser={refetchUser}
              />
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
