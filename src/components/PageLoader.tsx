import { BeatLoader } from "react-spinners";

type Props = {
  isMainPage?: boolean;
  noSubmenu?: boolean;
  bgColor?: string;
  mainBgColor?: string;
};
export const PageLoader = ({
  isMainPage,
  noSubmenu,
  bgColor = "",
  mainBgColor = "",
}: Props) => {
  return (
    <div
      className={`smooth-render-in h-screen bg-gradient-to-b from-[${bgColor}] to-[#000000] ${
        isMainPage || noSubmenu ? "bg-min-height-no-submenu" : "bg-min-height"
      } flex items-start justify-center ${isMainPage ? mainBgColor : bgColor}`}
    >
      <BeatLoader className="pt-32" color="#36d7b7" size={25} />
    </div>
  );
};
