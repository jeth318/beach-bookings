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

const Group = () => {
  const router = useRouter();
  const [errorToastMessage, setErrorToastMessage] = useState<string>();
  const [toastMessage, setToastMessage] = useState<string>();

  const { status: sessionStatus, data: sessionData } = useSession();
  const emailerMutation = api.emailer.sendInvitationEmail.useMutation();

  const { data: association, status } = api.association.getSingle.useQuery(
    { id: typeof router?.query?.id === "string" ? router?.query?.id : "" },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  const { data: members } = api.user.getUsersByAssociationId.useQuery({
    associationId: association?.id || "",
  });

  const { mutate: createInvite, isLoading: isCreatingInvite } =
    api.invite.create.useMutation({});

  const onInviteClicked = (event: FormEvent<HTMLFormElement> | undefined) => {
    event && event.preventDefault();

    if (searchQuery?.length && typeof router.query.id === "string") {
      createInvite(
        {
          email: searchQuery,
          associationId: router.query.id,
        },
        {
          onSuccess: () => {
            if (!association) {
              return null;
            }
            emailInviteDispatcher({
              mutation: emailerMutation,
              inviterName: sessionData?.user.name || "",
              email: searchQuery,
              association: association || null,
            });
            renderToast("Invitation email sent", setToastMessage);
            setSearchQuery("");
          },
          onError: (e) => {
            if (e.message === "INVITED_EMAIL_ALREADY_MEMBER") {
              renderToast(
                "Already a member of this group",
                setErrorToastMessage
              );
            }
            if (e.message === "EMAIL_HAS_PENDING_INVITE") {
              renderToast(
                "This player has already been invited.",
                setErrorToastMessage
              );
            }
          },
        }
      );
    }
    return null;
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

  if (!association) {
    return null;
  }

  return (
    <>
      {/* <SubHeader title={association.name} /> */}
      {toastMessage && <Toast body={toastMessage} />}
      {errorToastMessage && <Toast level="warning" body={errorToastMessage} />}

      <main className="min-w-sm pd-3  flex min-w-fit flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c] dark:text-white ">
        <div className="mb-8 mt-8 flex flex-row items-center justify-center text-white">
          <Image
            alt="beach-game"
            width={100}
            height={100}
            src="/beach-game.png"
          />
          <div className="flex flex-col items-start">
            <h2 className="heading text-center text-3xl ">
              {association.name}
            </h2>
            <h4 className="">{association.description}</h4>
          </div>
        </div>
        <div className="flex w-screen max-w-md flex-col p-4">
          <form className="flex flex-col" onSubmit={onInviteClicked}>
            <input
              disabled={isCreatingInvite}
              name="email"
              id="email"
              type="email"
              placeholder="Send an email invite"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-bordered input w-[100%] max-w-md"
            />
            <input
              type="submit"
              disabled={isCreatingInvite}
              className="btn mt-2 self-center"
              value="SEND INVITE"
            />
            {isCreatingInvite ? (
              <div className="self-center">
                <BeatLoader size={10} color="white" />
              </div>
            ) : (
              <div className="h-[24px]"></div>
            )}
          </form>
        </div>

        <div className="mb-8 mt-8 w-[100%] max-w-md overflow-x-auto p-4">
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
                    <th>
                      <button className="btn btn-ghost btn-xs">details</button>
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
