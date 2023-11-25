import { type ChangeEvent } from "react";

type SelectItem = {
  id: string;
  name: string;
};

export type Props = {
  label?: string;
  disabledOption?: string;
  description?: string;
  items: SelectItem[];
  valid: boolean;
  optionSuffix?: string;
  value: string | number;
  disabled?: boolean;
  defaultOption?: SelectItem;
  callback: (e: ChangeEvent<HTMLSelectElement>) => void | undefined;
};

export const SelectInput = ({
  label,
  disabledOption,
  description,
  valid,
  optionSuffix,
  value,
  items,
  disabled,
  defaultOption,
  callback,
}: Props) => {
  return (
    <div>
      <label className="label">
        <span className="label-text ">{description}</span>
      </label>
      <label
        className={`${label ? "input-group" : ""} ${
          valid ? "input-valid" : ""
        }`}
      >
        {!!label && (
          <span
            style={{ width: "33%" }}
            className="label-info-text flex justify-between pr-1"
          >
            <div>{label}</div>
            <div className="mr-1 self-center">{valid && "✅"}</div>
          </span>
        )}

        <select
          disabled={disabled}
          style={{ width: label ? "67%" : "100%" }}
          className="full-width select-bordered select w-[60%]"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => callback(e)}
          value={value}
        >
          {disabledOption && (
            <option disabled>{disabledOption || label}</option>
          )}
          {defaultOption && (
            <option
              key={defaultOption.id}
              value={defaultOption.name}
              data-id={defaultOption.id}
            >
              {defaultOption.name} {!!optionSuffix && optionSuffix}
            </option>
          )}
          {items.map((item) => (
            <option key={item.id} value={item.name} data-id={item.id}>
              {item.name} {!!optionSuffix && optionSuffix}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
