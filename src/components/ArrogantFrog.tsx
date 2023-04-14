import Image from "next/image";
import { getBgColor } from "~/utils/color.util";
import { CheckAvailability } from "./CheckAvailability";
import { getFrogText } from "~/utils/general.util";
import { useRouter } from "next/router";

export const ArrogantFrog = () => {
  const router = useRouter();
  const bgColor = getBgColor(router.asPath);
  const created = router.asPath === "/created";
  const main = router.asPath === "/";
  return (
    <div
      className={`bg-min-height${
        main ? "-no-submenu" : ""
      } smooth-render-in flex-row items-center justify-center self-center bg-gradient-to-b pt-12 ${bgColor}`}
    >
      <div className="flex flex-col items-center justify-center">
        <Image
          style={{ borderRadius: "50%" }}
          alt="frog"
          src="/cig-frog.gif"
          width={210}
          height={210}
        />
        <div className="flex flex-col justify-center p-4 text-center text-xl text-white">
          <div className="pb-4">{getFrogText(router.asPath)}</div>
          {created && <CheckAvailability />}
        </div>
      </div>
    </div>
  );
};
