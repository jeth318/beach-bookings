import Image from "next/image";
import { getBgColor } from "~/utils/color.util";
import { getFrogText } from "~/utils/general.util";
import { useRouter } from "next/router";
import Link from "next/link";

type Props = {
  submenu?: boolean;
};

export const ArrogantFrog = ({ submenu = true }: Props) => {
  const router = useRouter();
  const created = router.asPath === "/created";
  const joined = router.asPath === "/joined";
  const main = router.asPath === "/";
  return (
    <div className={`bg-min-height${!submenu ? "-no-submenu" : ""}`}>
      <div className="flex flex-col items-center">
        <Image
          className="rounded-full"
          alt="arrogant-frog"
          src="/beach-spike.png"
          width={210}
          height={210}
        />
        <div className="p-4 text-center text-xl text-white">
          <div
            dangerouslySetInnerHTML={{ __html: getFrogText(router.asPath) }}
          ></div>
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
    </div>
  );
};
