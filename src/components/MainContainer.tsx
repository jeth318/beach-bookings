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
  bgTo = "#000000",
  heightType = "h-screen",
  subheading = "",
}: Props) => {
  const baseClasses = "flex flex-col justify-center min-w-sm bg-gradient-to-b";

  return (
    <>
      {subheading && <SubHeader title={subheading} />}
      <main
        className={`${baseClasses} ${heightType} from-[${bgFrom}] to-[${bgTo}]`}
      >
        {children}
      </main>
    </>
  );
};

export default MainContainer;
