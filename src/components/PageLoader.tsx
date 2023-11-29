import { BeatLoader } from "react-spinners";

type Props = {
  color?: string;
};
export const PageLoader = ({ color = "#ffffff" }: Props) => {
  return (
    <div className={`flex h-screen items-start justify-center`}>
      <BeatLoader className="mt-32" color={color} size={25} />
    </div>
  );
};
