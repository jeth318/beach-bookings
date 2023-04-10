import Image from "next/image";

type Props = {
  path: string;
  width?: number;
  height?: number;
  fill?: string;
};

export const CustomIcon = ({ path, width, height }: Props) => (
  <Image
    src={path}
    width={width || 20}
    height={height || width || 20}
    alt={path}
    color="white"
  />
);
