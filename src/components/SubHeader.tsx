type Props = {
  title: string;
};

export const SubHeader = ({ title }: Props) => {
  return (
    <div
      style={{
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
      }}
      className="subheader sticky z-30 bg-slate-200 p-1 text-center text-lg shadow-md shadow-stone-900 dark:bg-slate-800 dark:text-slate-400"
    >
      {title}
    </div>
  );
};
