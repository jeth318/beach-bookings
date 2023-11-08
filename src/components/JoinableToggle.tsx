import { BeatLoader } from "react-spinners";
import { CustomIcon } from "./CustomIcon";
import { type ChangeEvent, useState } from "react";
import { api } from "~/utils/api";

type Props = {
  value: boolean;
  isLoading: boolean | undefined;
  textColor?: string;
  callback: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const JoinableToggle = ({ value, isLoading, callback }: Props) => {
  return (
    <label
      style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
      className="smooth-render-in flex flex-row justify-between bg-slate-200 p-2 dark:bg-slate-800"
    >
      <div className="flex w-max items-center space-x-2">
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
            Allow players to join this party. You can change this anytime.
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div style={{ height: "24px" }}></div>
        <div className="self-center pl-2 pr-2">
          <input
            id="joinable-input"
            type="checkbox"
            className={`toggle-success toggle toggle-lg`}
            onChange={callback}
            checked={value}
          />
        </div>
        {isLoading ? (
          <div className="self-center ">
            <BeatLoader size={10} color="purple" />
          </div>
        ) : (
          <div style={{ height: "24px" }}></div>
        )}
      </div>
    </label>
  );
};
