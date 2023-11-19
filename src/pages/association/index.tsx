import Image from "next/image";
import Link from "next/link";
import { SubHeader } from "~/components/SubHeader";
import useUserAssociations from "../hooks/useUserAssociations";
import useUser from "../hooks/useUser";
import { useSession } from "next-auth/react";
import { PageLoader } from "~/components/PageLoader";
import { CustomIcon } from "~/components/CustomIcon";
import { Association } from "@prisma/client";

const Association = () => {
  const { data: sessionData } = useSession();
  const { user } = useUser({ email: sessionData?.user.email });

  const {
    joinedAssociations,
    isMultiGroupMember,
    isWithoutGroup,
    isOneGroupMember,
    isJoinedAssociationsFetched,
  } = useUserAssociations({ associationIds: user?.associations });

  console.log({
    joinedAssociations,
    isMultiGroupMember,
    isWithoutGroup,
    isOneGroupMember,
  });

  if (!user || !isJoinedAssociationsFetched) {
    return (
      <>
        <SubHeader title="Groups" />
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
        <div className="flex h-full flex-col bg-gradient-to-b from-[#a31da1] to-[#15162c] p-3 text-white">
          <Image
            alt="beach-game"
            width={100}
            height={100}
            src="/beach-game.png"
          />
          <h2 className="mb-4 text-center text-4xl">No groups joined</h2>
          <h3 className="text-center text-xl text-white">
            You are not a part of a group yet. Group members can invite you.
            Meanwhile, you can join public bookings from the home page.
          </h3>

          <Link
            href="/association/create"
            className="btn-info btn mt-5 text-white"
          >
            Create a group
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <SubHeader title="Groups" />
      <main className="min-w-sm pd-3 flex h-full min-w-fit flex-col bg-gradient-to-b from-[#a31da1] to-[#15162c]">
        {joinedAssociations?.map((association: Association) => {
          const maxPlayers = 4;

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
                      <h2 className="font-bil card-title text-2xl font-bold">
                        {association.name}
                      </h2>
                      <div className="flex flex-col pb-1 font-medium">
                        <div
                          style={{ maxWidth: "150px" }}
                          className="transparent-background-grey self-start rounded-lg border border-slate-600 p-1"
                        >
                          <div className="flex flex-row items-center self-start pb-1 ">
                            <span className="pr-2">
                              <CustomIcon path="/svg/people.svg" width={18} />
                            </span>
                            <div
                              style={{ maxWidth: 100 }}
                              className="overflow-dots"
                            >
                              12 members
                            </div>
                          </div>
                          <div className="flex flex-row items-center justify-start">
                            <span className="pr-1">
                              <CustomIcon
                                path="/svg/location-arrow.svg"
                                width={20}
                              />
                            </span>
                            <div>
                              <div className="flex flex-row items-center">
                                GBC Kviberg
                              </div>
                            </div>
                          </div>
                        </div>
                        <div></div>
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
                              htmlFor="action-modal-leave-booking"
                              onClick={() => void null}
                              className="btn-warning btn-sm btn text-white"
                            >
                              Leave
                            </label>

                            {!!user?.id && association.userId === user.id && (
                              <button className="btn-sm btn text-white">
                                <Link
                                  href={{
                                    pathname: `/association/${association.id}`,
                                  }}
                                >
                                  Edit
                                </Link>
                              </button>
                            )}
                            {!!user?.id && association.userId === user.id && (
                              <label
                                htmlFor="action-modal-delete-booking"
                                onClick={() => void null}
                                className="btn-error btn-sm btn text-white"
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
      </main>
      <div className="m-4 flex justify-center border-zinc-400">
        <Link href="/association/create" className="btn-accent btn">
          Create new
        </Link>
      </div>
    </>
  );
};

export default Association;
