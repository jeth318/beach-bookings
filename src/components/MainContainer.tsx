import { SubHeader } from "./SubHeader";

type Props = {
  children: React.ReactNode | null;
  bgFrom?: string;
  bgTo?: string;
  heightType?: string;
  subheading?: string;
};

const MainContainer = ({
  children,
  bgFrom = "[#2c0168]",
  bgTo = "[#000000]",
  heightType = "h-screen",
  subheading = "",
}: Props) => {
  const baseClasses = "flex flex-col min-w-sm ";

  return (
    <>
      {subheading && <SubHeader title={subheading} />}
      <main
        className={`${baseClasses} ${heightType} bg-gradient-to-b from-${bgFrom} to-${bgTo}`}
      >
        {children}
      </main>
    </>
  );
};

export default MainContainer;
