import Image from "next/image";
import { getBgColor } from "~/utils/color.util";
import { CheckAvailability } from "./CheckAvailability";
import { getFrogText } from "~/utils/general.util";
import { useRouter } from "next/router";
import Link from "next/link";

export const ArrogantFrog = () => {
  const router = useRouter();
  const bgColor = getBgColor(router.asPath);
  const created = router.asPath === "/created";
  const joined = router.asPath === "/joined";
  const main = router.asPath === "/";
  return (
    <div
      className={`bg-min-height${
        main ? "-no-submenu" : ""
      } smooth-render-in bg-gradient-to-b pt-12 ${bgColor}`}
    >
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
              <Link className="btn-info btn " href="/booking">
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
