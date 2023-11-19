import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { PageLoader } from "~/components/PageLoader";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { emailInviteDispatcher } from "~/utils/booking.util";
import { BeatLoader } from "react-spinners";
import { renderToast } from "~/utils/general.util";
import { Toast } from "~/components/Toast";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import useSingleAssociations from "../hooks/useSingleAssociation";
import useEmail from "../hooks/useEmail";
import useUser from "../hooks/useUser";
import useInvite from "../hooks/useInvite";
import useUserAssociations from "../hooks/useUserAssociations";

const Group = () => {
  const router = useRouter();
  const associationId =
    typeof router.query.id === "string" ? router.query.id : "";
  const { status: sessionStatus, data: sessionData } = useSession();
  const [errorToastMessage, setErrorToastMessage] = useState<string>();
  const [toastMessage, setToastMessage] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const { sendEmail, sendInvitationEmail } = useEmail();
  const { user, isUserFetched } = useUser({
    email: sessionData?.user.email || undefined,
  });

  const { association, isSingleAssociationFetched } = useSingleAssociations({
    associationId,
  });

  const { data: members, isFetched: hasFetchedMembers } =
    api.user.getUsersByAssociationId.useQuery({
      associationId: association?.id || "",
    });

  const { joinedAssociations } = useUserAssociations({
    associationIds: user?.associations,
  });

  const { createInvite, isLoadingInviteCreate } = useInvite({});

  const onInviteClicked = (event: FormEvent<HTMLFormElement> | undefined) => {
    event && event.preventDefault();

    const onInviteError = (e: { message: string }) => {
      if (e.message === "INVITED_EMAIL_ALREADY_MEMBER") {
        renderToast("Already a member of this group", setErrorToastMessage);
      }
      if (e.message === "EMAIL_HAS_PENDING_INVITE") {
        renderToast(
          "This player has already been invited.",
          setErrorToastMessage
        );
      }
    };

    const onInviteSuccess = () => {
      if (!association || typeof searchQuery !== "string") {
        return null;
      }

      emailInviteDispatcher({
        sendEmail: sendInvitationEmail,
        inviterName: sessionData?.user.name || "",
        email: searchQuery,
        association: association,
      });
      renderToast("Invitation email sent", setToastMessage);
      setSearchQuery("");
    };

    if (!searchQuery?.length || typeof router.query.id !== "string") {
      return null;
    }

    createInvite(
      {
        email: searchQuery,
        associationId: router.query.id,
      },
      {
        onSuccess: onInviteSuccess,
        onError: onInviteError,
      }
    );
  };

  if (
    sessionStatus === "loading" ||
    !isSingleAssociationFetched ||
    !hasFetchedMembers ||
    !isUserFetched
  ) {
    return (
      <PageLoader
        noSubmenu
        isMainPage={false}
        bgColor={"bg-gradient-to-b from-[#a31da1] to-[#000000]"}
      />
    );
  }

  if (!association) {
    return <div>No association found</div>;
  }

  if (!user?.associations.includes(association.id)) {
    return <ArrogantFrog />;
  }

  return (
    <>
      {/* <SubHeader title={association.name} /> */}
      {toastMessage && <Toast body={toastMessage} />}
      {errorToastMessage && <Toast level="error" body={errorToastMessage} />}

      <main className="min-w-sm pd-3 smooth-render-in flex h-screen min-w-fit flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c] dark:text-white ">
        <div className="4 mt-4 flex flex-row items-center justify-center text-white">
          <Image
            alt="beach-game"
            width={100}
            height={100}
            src="/beach-game.png"
          />
          <div className="flex flex-col items-start">
            <h2
              className="heading 
            text-3xl "
            >
              {association.name}
            </h2>
            <h4 className="">{association.description}</h4>
          </div>
        </div>

        <div className="mb-4 mt-2 w-[100%] max-w-md overflow-x-auto p-4">
          <table className="table-compact table w-[100%]">
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
                      {association.admins.includes(member.id) &&
                        association.userId !== member.id && (
                          <>
                            <br />
                            <span className="badge badge-ghost badge-sm">
                              administrator
                            </span>
                          </>
                        )}
                      {association.userId === member.id && (
                        <>
                          <br />
                          <span className="badge badge-ghost badge-sm">
                            group owner
                          </span>
                        </>
                      )}
                    </td>
                    {/*  <th>
                      <button className="btn-ghost btn-xs btn">details</button>
                    </th> */}
                  </tr>
                );
              })}
            </tbody>
            {/* foot */}
            <tfoot>
              <tr>
                <th></th>
                <th></th>
                {/* <th></th> */}
              </tr>
            </tfoot>
          </table>
        </div>
        <hr style={{ width: "100%", color: "lightgrey" }} />
        <div className="flex w-screen max-w-md flex-col p-4">
          <form className="flex flex-col" onSubmit={onInviteClicked}>
            <label className="label" htmlFor="email">
              Invite a friend
            </label>
            <input
              disabled={isLoadingInviteCreate}
              name="email"
              id="email"
              type="email"
              placeholder="Enter email to invite..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-bordered input w-[100%]"
            />
            <button
              type="submit"
              className="btn btn-accent mt-4 self-end"
              disabled={
                isLoadingInviteCreate ||
                !searchQuery?.length ||
                searchQuery?.length < 5
              }
            >
              {isLoadingInviteCreate ? (
                <div className="flex items-center self-center">
                  <BeatLoader className="w-[46px]" size={10} color="white" />
                </div>
              ) : (
                <span>Send invite</span>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default Group;
