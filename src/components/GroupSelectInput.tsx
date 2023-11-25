import { type ChangeEvent } from "react";

type Item = {
  id: string;
  name: string;
};

export type Props = {
  label: string;
  disabledOption?: string;
  description?: string;
  items: Item[];
  valid: boolean;
  optionSuffix?: string;
  value: string | number;
  disabled?: boolean;
  callback: (e: ChangeEvent<HTMLSelectElement>) => void | undefined;
};

export const GroupSelectInput = ({
  label,
  disabledOption,
  description,
  valid,
  optionSuffix,
  value,
  items,
  disabled,
  callback,
}: Props) => {
  return (
    <div>
      <label className="label">
        <span className="label-text ">{description}</span>
      </label>
      <label className={`input-group ${valid ? "input-valid" : ""}`}>
        <select
          disabled={disabled}
          style={{ width: "100%" }}
          className="full-width select-bordered select w-[60%]"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => callback(e)}
          value={value}
        >
          <option disabled>{disabledOption || label}</option>
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
