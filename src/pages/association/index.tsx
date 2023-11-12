import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { PlayersTable } from "~/components/PlayersTable";
import { SubHeader } from "~/components/SubHeader";
import { api } from "~/utils/api";

const Association = () => {
  const sessionData = useSession();

  const { data: user } = api.user.get.useQuery();

  const { data: joinedAssociations, isFetched: hasFetchedUserAssociations } =
    api.association.getForUser.useQuery(
      { ids: user?.associations || [] },
      {
        enabled: !!sessionData?.data?.user.id && !!user?.associations,
      }
    );

  if (hasFetchedUserAssociations && !joinedAssociations?.length) {
    return (
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c]">
        <div className="flex h-screen flex-col items-center p-3">
          <Image
            alt="beach-spike"
            width={300}
            height={300}
            src="/beach-game.png"
          />
          <h2 className="mb-4 text-4xl text-white">No groups joined</h2>
          <h3 className="text-center text-xl text-white">
            You are not a part of a group yet. Group members can invite you.
            Meanwhile, you can join public bookings from the home page.
          </h3>
          <Link href="/" className="btn-info btn mt-10 text-white">
            Home
          </Link>
        </div>
      </main>
    );
  }

  if (!!sessionData.data?.user.id && !!joinedAssociations?.length) {
    return (
      <>
        <SubHeader title="Groups" />
        <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c]">
          <div className="flex h-screen flex-col items-center p-3">
            <Image
              alt="beach-spike"
              width={300}
              height={300}
              src="/beach-game.png"
            />
            <h2 className="mb-4 text-4xl text-white">My groups</h2>

            <div className="flex flex-col items-center justify-center">
              {joinedAssociations.map((association) => {
                return (
                  <Link
                    key={association.id}
                    href={`/association/${association.id}`}
                    className="mt-10text-white btn-primary btn"
                  >
                    <div className="">{association.name}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </>
    );
  }
};

export default Association;
