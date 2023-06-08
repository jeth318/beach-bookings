import Image from "next/image";

type Props = {
  path: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: string;
};

export const CustomIcon = ({ path, width, height, alt }: Props) => (
  <Image
    src={path}
    width={width || 20}
    height={height || width || 20}
    alt={alt || path}
    color="white"
  />
);
