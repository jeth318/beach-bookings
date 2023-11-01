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
  callback,
}: Props) => {
  return (
    <>
      <label className="label">
        <span className="label-text text-white">{description}</span>
      </label>
      <label className={`input-group ${valid ? "input-valid" : ""}`}>
        <span className="label-info-text">
          {label} {valid && "✅"}
        </span>

        <select
          className="full-width select-bordered select"
          onChange={(e: ChangeEvent<HTMLSelectElement>) => callback(e)}
          value={value}
        >
          <option disabled>{disabledOption || label}</option>
          {items.map((item) => (
            <option key={item.id} value={item.name} data-facility-id={item.id}>
              {item.name} {!!optionSuffix && optionSuffix}
            </option>
          ))}
        </select>
      </label>
    </>
  );
};
