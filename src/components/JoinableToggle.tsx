import { BeatLoader } from "react-spinners";

type Props = {
  value: boolean;
  isLoading: boolean | undefined;
  textColor?: string;
  callback: () => void;
};

export const JoinableToggle = ({
  value,
  isLoading,
  callback,
  textColor = "",
}: Props) => {
  return (
    <div className="flex flex-col self-start">
      <div>
        <label className="label mt-2">
          <span className={`label-text text-${textColor}`}>
            Allow players to join
          </span>
        </label>
        <label>
          <input
            type="checkbox"
            className={`toggle-accent toggle toggle-md`}
            onChange={callback}
            checked={value}
          />
        </label>
      </div>
      {isLoading ? (
        <div className="self-start">
          <BeatLoader size={10} color="purple" />
        </div>
      ) : (
        <div style={{ height: "24px" }}></div>
      )}
    </div>
  );
};
