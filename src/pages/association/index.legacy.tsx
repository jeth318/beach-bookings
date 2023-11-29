import Image from "next/image";
import Link from "next/link";
import { SubHeader } from "~/components/SubHeader";
import useUserAssociations from "../../hooks/useUserAssociations";
import useUser from "../../hooks/useUser";
import { useSession } from "next-auth/react";
import { PageLoader } from "~/components/PageLoader";
import { CustomIcon } from "~/components/CustomIcon";
import MainContainer from "~/components/MainContainer";

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

  if (!user || !isJoinedAssociationsFetched) {
    return (
      <>
        <SubHeader title="Groups" />
        <PageLoader />
      </>
    );
  }

  if (isWithoutGroup) {
    return (
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c]">
        <div className="flex h-screen flex-col items-center p-3">
          <Image
            alt="beach-game"
            width={100}
            height={100}
            src="/beach-game.png"
          />
          <h2 className="mb-4 text-center text-4xl">No groups joined</h2>
          <h3 className="text-center text-xl ">
            You are not a part of a group yet. Group members can invite you.
            Meanwhile, you can join public bookings from the home page.
          </h3>

          <Link href="/association/create" className="btn-info btn mt-5 ">
            Create a group
          </Link>
        </div>
      </main>
    );
  }
  const bgFrom = "#a31da1";
  const bgTo = "#15162c";
  return (
    <>
      <MainContainer subheading="Groups" bgFrom={bgFrom} bgTo={bgTo}>
        <div className="flex h-screen flex-col items-center p-3">
          <Image
            alt="beach-game"
            width={150}
            height={150}
            src="/beach-game.png"
          />
          <div className="mb-10 mt-2 flex flex-col items-center justify-center rounded-md border p-4">
            <h2 className="mb-4 text-4xl ">My groups</h2>

            <div className="flex flex-col items-center justify-center">
              {joinedAssociations?.map((association) => {
                return (
                  <Link
                    key={association.id}
                    href={`/association/${association.id}`}
                    className="btn-secondary btn m-1 min-w-[250px] "
                  >
                    <div className="">{association.name}</div>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link href="/association/create" className="btn-accent btn mb-2">
            <div className="flex flex-row items-center justify-between">
              <div className="mr-2">Create</div>
              <CustomIcon height={30} width={30} path="/svg/add-circle.svg" />
            </div>
          </Link>
        </div>
      </MainContainer>
    </>
  );
};

export default Association;
