import Image from "next/image";
import { getFrogText } from "~/utils/general.util";
import { useRouter } from "next/router";
import Link from "next/link";

type Props = {
  submenu?: boolean;
  text?: string;
  children?: React.ReactNode;
};

export const ArrogantFrog = ({ text, children }: Props) => {
  const router = useRouter();
  const joined = router.asPath === "/joined";
  const main = router.asPath === "/";
  return (
    <div className="flex h-screen flex-col items-center">
      <Image
        className="rounded-full"
        alt="arrogant-frog"
        src="/beach-spike.png"
        width={210}
        height={210}
      />
      <div className="p-4 text-center text-xl text-white">
        {children ? (
          children
        ) : (
          <div
            dangerouslySetInnerHTML={{
              __html: text || getFrogText(router.asPath),
            }}
          ></div>
        )}
        {main && (
          <div className="flex items-center justify-center">
            <Link className="btn-info btn mt-4" href="/booking">
              Publish
            </Link>
          </div>
        )}
        {joined && (
          <div className="flex flex-col items-center">
            <div>
              <Link className="btn-secondary btn mt-4" href="/">
                All bookings
              </Link>
            </div>
            <div className="divider"></div>
            {/* <div className="text-sm">
                Or perhaps create a booking your self?
              </div> */}
          </div>
        )}
        {/* {(created || joined) && <CheckAvailability />} */}
      </div>
    </div>
  );
};
