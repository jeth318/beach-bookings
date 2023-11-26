import Image from "next/image";
import Link from "next/link";
import { SubHeader } from "~/components/SubHeader";
import useUserAssociations from "../../hooks/useUserAssociations";
import useUser from "../../hooks/useUser";
import { useSession } from "next-auth/react";
import { PageLoader } from "~/components/PageLoader";
import { Association } from "@prisma/client";
import ActionModal from "~/components/ActionModal";
import { useRouter } from "next/router";
import {
  associationToastMessages,
  leaveAssociationText,
  removeAssociationText,
  renderToast,
} from "~/utils/general.util";
import useAssociation from "../../hooks/useAssociation";
import { parseErrorMessage } from "~/utils/error.util";
import { useState } from "react";
import { Toast } from "~/components/Toast";

const Association = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const { user, updateUserAssociations, refetchUser } = useUser({
    email: sessionData?.user.email,
  });

  const [associationToLeave, setAssociationToLeave] =
    useState<Association | null>(null);

  const [associationToDelete, setAssociationToDelete] =
    useState<Association | null>(null);

  const [toastMessage, setToastMessage] = useState<string>();

  const { joinedAssociations, isWithoutGroup, isJoinedAssociationsFetched } =
    useUserAssociations({ associationIds: user?.associations });

  const { deleteAssociation } = useAssociation();

  const onAssociationDeleteClicked = async () => {
    if (!associationToDelete?.id) {
      return null;
    }

    try {
      await deleteAssociation({ id: associationToDelete?.id });
      await refetchUser();
      renderToast(associationToastMessages.DELETE, setToastMessage);
    } catch (error) {
      console.error(parseErrorMessage(error));
    }
  };

  const onAssociationLeaveClicked = async () => {
    const updatedAssociations =
      user?.associations.filter(
        (association) => association !== associationToLeave?.id
      ) || [];

    try {
      await updateUserAssociations({ associations: updatedAssociations });
      await refetchUser();
      renderToast(associationToastMessages.LEAVE, setToastMessage);
    } catch (error) {
      console.error(parseErrorMessage(error));
    }
  };

  if (!user || !isJoinedAssociationsFetched) {
    return (
      <>
        <SubHeader title="My groups" />
        <PageLoader
          noSubmenu
          bgColor={"bg-gradient-to-b from-[#a31da1] to-[#15162c]"}
        />
      </>
    );
  }

  if (isWithoutGroup) {
    return (
      <main className="min-w-sm flex min-w-fit flex-col">
        <div
          style={{ height: "calc(100vh - 65px)" }}
          className="flex flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c] p-3 "
        >
          <Image
            alt="beach-game"
            width={300}
            height={300}
            src="/beach-game.png"
          />
          <h2 className="mb-4 text-center text-4xl text-white">
            No groups joined
          </h2>
          <h3 className="text-center text-xl text-white">
            You are not a part of a group yet. Group members can invite you.
            Meanwhile, you can join public bookings from the home page.
          </h3>

          <Link href="/association/create" className="btn-accent btn mt-5">
            Create a group
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {toastMessage && <Toast body={toastMessage} />}
      <SubHeader title="My groups" />
      <main className="min-w-sm pd-3 flex h-full min-w-fit flex-col bg-gradient-to-b from-[#a31da1] to-[#15162c]">
        {["delete", "leave"].flatMap((action) => {
          let level = "error";
          let body = "";
          let callback;
          let emoji = "";

          switch (action) {
            case "delete":
              level = "error";
              body = removeAssociationText;
              emoji = "☠️";
              callback = onAssociationDeleteClicked;

              break;
            case "leave":
              level = "warning";
              body = leaveAssociationText;
              emoji = "🚪";
              callback = onAssociationLeaveClicked;
              break;
            default:
              callback = () => {
                return null;
              };
          }

          let title = `Confirm ${action} ${emoji}`;
          let confirmButtonText =
            action.charAt(0).toUpperCase() + action.slice(1);

          if (!user?.name || user.name.length < 3) {
            callback = async () => {
              await router.push("/settings");
            };
            title = "What is your name?";
            confirmButtonText = "Settings";
            level = "info";
            body = `Please go to settings and enter your name in order to ${action} this booking.`;
          }

          return (
            <ActionModal
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              callback={callback}
              tagRef={`${action}-association`}
              title={title}
              body={body}
              confirmButtonText={confirmButtonText}
              cancelButtonText="Cancel"
              level={level}
            />
          );
        })}
        <div className="mt-4">
          {joinedAssociations?.map((association: Association) => {
            return (
              <div
                key={association.id}
                className="smooth-render-in first:border-b-1 border-b border-zinc-400"
              >
                <div className="card-compact card">
                  <div
                    className={`card-body flex-row justify-between text-primary-content`}
                  >
                    <div className="flex flex-col">
                      <div>
                        <Link
                          href={`/association/${association.id}`}
                          className="font-bil link card-title text-2xl font-bold"
                        >
                          {association.name}
                        </Link>
                        <div className="flex flex-col pb-1 font-medium">
                          <div className="pr-2">{association.description}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex flex-col self-end pb-2">
                        <div
                          style={{ marginTop: "1.5rem" }}
                          className="flex flex-col self-center"
                        >
                          {!!user.id ? (
                            <div
                              style={{ width: "auto" }}
                              className="smooth-render-in-slower btn-group btn-group-vertical flex"
                            >
                              <label
                                htmlFor="action-modal-leave-association"
                                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                onClick={() =>
                                  setAssociationToLeave(association)
                                }
                                className="btn-warning btn-sm btn min-w-[75px] "
                              >
                                Leave
                              </label>

                              {!!user?.id && association.userId === user.id && (
                                <button className="btn-sm btn ">
                                  <Link
                                    href={{
                                      pathname: `/association/modify/${association.id}`,
                                    }}
                                  >
                                    Edit
                                  </Link>
                                </button>
                              )}
                              {!!user?.id && association.userId === user.id && (
                                <label
                                  htmlFor="action-modal-delete-association"
                                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                  className="btn-error btn-sm btn "
                                  onClick={() =>
                                    setAssociationToDelete(association)
                                  }
                                >
                                  Delete
                                </label>
                              )}
                            </div>
                          ) : (
                            <div style={{ height: "32px" }}></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <div className="m-4 flex justify-center border-zinc-400">
        <Link href="/association/create" className={`btn-outline`}>
          Create new
        </Link>
      </div>
    </>
  );
};

export default Association;
