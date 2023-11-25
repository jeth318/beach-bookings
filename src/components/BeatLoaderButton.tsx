import { BeatLoader } from "react-spinners";

type Props = {
  isLoading: boolean;
  value: string;
  size?: "sm" | "md" | "lg";
};
const BeatLoaderButton = ({ value, isLoading, size = "sm" }: Props) => {
  return (
    <div>{isLoading ? <BeatLoader size={10} color="white" /> : value}</div>
  );
};

export default BeatLoaderButton;
