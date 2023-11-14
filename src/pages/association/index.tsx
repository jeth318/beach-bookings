import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { SubHeader } from "~/components/SubHeader";
import { api } from "~/utils/api";
import { useAssociations } from "../hooks/useAssociations";

const Association = () => {
  const router = useRouter();
  const { data: user } = api.user.get.useQuery();
  const {
    joinedAssociations,
    isMultiGroupMember,
    isWithoutGroup,
    isOneGroupMember,
  } = useAssociations(user?.email || "");

  if (isWithoutGroup) {
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

  if (isMultiGroupMember) {
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
              {joinedAssociations?.map((association) => {
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

  if (isOneGroupMember) {
    void router.push(`/association/${joinedAssociations?.[0]?.id as string}`);
    return null;
  }
};

export default Association;
