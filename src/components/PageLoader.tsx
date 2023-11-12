import { BeatLoader } from "react-spinners";

type Props = { isMainPage?: boolean; bgColor?: string; mainBgColor?: string };
export const PageLoader = ({
  isMainPage,
  bgColor = "",
  mainBgColor = "",
}: Props) => {
  return (
    <div
      className={`smooth-render-in bg-gradient-to-b from-[#005e1ba6] to-[#000000] ${
        isMainPage ? "bg-min-height-no-submenu" : "bg-min-height"
      } flex items-start justify-center ${isMainPage ? mainBgColor : bgColor}`}
    >
      <BeatLoader className="pt-32" color="#36d7b7" size={25} />
    </div>
  );
};
