import { BeatLoader } from "react-spinners";
import { CustomIcon } from "./CustomIcon";
import { type ChangeEvent, useState } from "react";
import { api } from "~/utils/api";

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
  const [joinable, setJoinable] = useState<boolean>();

  const onJoinableChange = (event: ChangeEvent<HTMLInputElement>) => {
    setJoinable(!!event.target.value);
    callback();
  };

  return (
    <div
      style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
      className="smooth-render-in flex flex-row justify-between bg-slate-200 p-2 dark:bg-slate-800"
    >
      <div className="flex items-center space-x-2">
        <div className="avatar">
          <div className="mask h-10 w-10">
            <CustomIcon height={100} width={100} path={`/svg/group.svg`} />
          </div>
        </div>
        <div>
          <div className="font-bold">Joinable</div>
          <div
            className="text-sm opacity-60"
            style={{
              overflow: "hidden",
              maxWidth: "150px",
              textOverflow: "n",
            }}
          >
            Allow players to join. You can change this at anytime.
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div style={{ height: "24px" }}></div>
        <div className="self-center pl-2 pr-2">
          <label>
            <input
              type="checkbox"
              className={`toggle-success toggle toggle-lg`}
              onChange={onJoinableChange}
              checked={joinable}
            />
          </label>
        </div>
        {isLoading ? (
          <div className="self-center ">
            <BeatLoader size={10} color="purple" />
          </div>
        ) : (
          <div style={{ height: "24px" }}></div>
        )}
      </div>
    </div>
  );
};
