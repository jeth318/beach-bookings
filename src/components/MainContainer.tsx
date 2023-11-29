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
  bgFrom = "",
  bgTo = "000000",
  heightType = "h-screen",
  subheading = "",
}: Props) => {
  const baseClasses =
    "min-w-sm max-w-md smooth-render-in min-w-fit bg-gradient-to-b";

  return (
    <>
      {subheading && <SubHeader title={subheading} />}
      <main
        className={`${baseClasses} ${heightType} bg-gradient-to-b from-[#${bgFrom}] to-[#${bgTo}]`}
      >
        {children}
      </main>
    </>
  );
};

export default MainContainer;
