type Props = {
  children: React.ReactNode | null;
  bgFrom?: string;
  bgTo?: string;
  heightType?: "h-screen" | "h-full";
};

const MainContainer = ({
  children,
  bgFrom = "",
  bgTo = "000000",
  heightType = "h-screen",
}: Props) => {
  const baseClasses =
    "min-w-sm pd-3 smooth-render-in min-w-fit bg-gradient-to-b";

  return (
    <main
      className={`${baseClasses} ${heightType} bg-gradient-to-b pt-[90px] from-[#${bgFrom}] to-[#${bgTo}]`}
    >
      {children}
    </main>
  );
};

export default MainContainer;
