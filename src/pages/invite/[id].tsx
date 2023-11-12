import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { PageLoader } from "~/components/PageLoader";
import ActionModal from "~/components/ActionModal";
import { type User } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";
import { BeatLoader } from "react-spinners";

const Invite = () => {
  const router = useRouter();
  const [isAcceptingInvite, setIsAcceptingInvite] = useState<boolean>(false);
  const { status: sessionStatus, data: sessionData } = useSession();
  const { data: invite, isFetching: isFetchingInvite } =
    api.invite.get.useQuery(
      {
        email: sessionData?.user.email || "",
        associationId: (router.query.id as string) || "",
      },
      {
        enabled:
          typeof sessionData?.user.email === "string" &&
          typeof router?.query?.id === "string",
      }
    );

  const { data: association, isFetching: isFetchingAssociation } =
    api.association.getSingle.useQuery(
      {
        id: (router.query.id as string) || "",
      },
      {
        enabled: !!invite,
      }
    );

  const { data: inviter, isFetching: isFetchingInviter } =
    api.user.getById.useQuery(
      {
        id: (invite?.invitedBy as string) || "",
      },
      {
        enabled: !!association && !!invite,
      }
    );

  const { data: user, isFetching: isFetchingUser } = api.user.get.useQuery(
    undefined,
    {
      enabled: !!sessionData?.user,
    }
  );

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
        bgColor={"bg-gradient-to-b from-[#161b22] to-[#000000]"}
      />
    );
  }

  if (sessionStatus === "unauthenticated") {
    void signIn();
    return null;
  }

  if (
    isFetchingAssociation ||
    isFetchingUser ||
    isFetchingInviter ||
    isFetchingInvite
  ) {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#005e1ba6] to-[#000000]"}
      />
    );
  }

  if (!invite || !user || !association || !inviter) {
    return <div>could not find invite</div>;
  }

  if (user.associations.includes(String(invite.associationId))) {
    void router.push(`/association/${invite.associationId}`);
    return null;
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col text-white">
      <SubHeader title="Invitation" />
      <div
        className={`smooth-render-in bookings-container flex min-h-[400px] flex-col items-center justify-center bg-gradient-to-b from-[#005e1ba6] to-[#000000]`}
      >
        <ActionModal
          title={"Group invitation"}
          callback={onJoinConfirmed}
          tagRef="invite"
          cancelButtonText="No thanks"
          confirmButtonText="JOIN group"
          level="success"
        >
          <p className="py-4">
            {inviter?.name || "A player"} has invited you to join their group{" "}
            <strong>{association?.name}</strong>
          </p>
        </ActionModal>
        <div className="flex flex-col items-center justify-center">
          <h4>
            {inviter?.name || "A player"} has invited you to join their group{" "}
          </h4>
          <h2 className="text-2xl">{association.name}</h2>

          <button
            onClick={onJoinConfirmed}
            disabled={isAcceptingInvite}
            className="btn-primary btn mb-4 mt-4 animate-pulse text-white"
          >
            Accept invite
          </button>
          {isAcceptingInvite ? (
            <BeatLoader color="white" size={20} />
          ) : (
            <div className="h-[24px]"></div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Invite;
