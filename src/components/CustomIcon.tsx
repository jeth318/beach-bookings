import Image from "next/image";

type Props = {
  path: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: string;
  rounded?: boolean;
};

export const CustomIcon = ({ path, width, height, alt, rounded }: Props) => (
  <Image
    src={path}
    width={width || 20}
    height={height || width || 20}
    alt={alt || path}
    className={`stroke-cyan-500 ${rounded ? "rounded" : ""}`}
    color="white"
  />
);
