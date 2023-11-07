import { useState, type ChangeEvent, useReducer, useEffect } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "~/utils/api";
import { Toast } from "./Toast";
import { type User } from "@prisma/client";

type Props = {
  user?: User;
};

export const PlayerInfo = ({ user }: Props) => {
  const [toastMessage, setToastMessage] = useState<string>();

  const { mutate: mutatePhone, isLoading: isLoadingPhoneMutation } =
    api.user.updatePhone.useMutation({});

  const { mutate: mutateName, isLoading: isLoadingNameMutation } =
    api.user.updateName.useMutation({});

  const { refetch: refetchUser } = api.user.get.useQuery();

  const [phoneInput, setPhoneInput] = useState<string>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    user?.phone || ""
  );

  const [nameInput, setNameInput] = useState<string | null>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    user?.name || null
  );

  const [isNameValid, setIsNameValid] = useState<boolean>(true);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const isLoading = isLoadingPhoneMutation || isLoadingNameMutation;

  const validPhone = !phoneInput || phoneInput.length <= 30;

  const validName = !!(
    nameInput &&
    nameInput?.length > 2 &&
    nameInput.length <= 30
  );

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

  const onNameInputBlur = (event: ChangeEvent<HTMLInputElement>) => {
    setIsNameValid(validName);
    if (event.target.value.length < 3 || event.target.value.length > 30) {
      setIsNameValid(false);
      return null;
    }

    setNameInput(event.target.value);
  };

  const onPhoneInputBlur = (event: ChangeEvent<HTMLInputElement>) => {
    setIsPhoneValid(validPhone);
    setPhoneInput(event.target.value);
  };

  const hasContactInfoChanged =
    user?.name !== nameInput || user.phone !== phoneInput;

  return (
    <div>
      {toastMessage && <Toast body={toastMessage} />}
      <div className="flex flex-col justify-center text-center">
        <div className="mb-2 mt-4 text-xl text-white">
          <strong>Player information 🥇</strong>
        </div>
      </div>
      <div
        style={{ width: "100%" }}
        className="flex max-w-md flex-col justify-center"
      >
        <div style={{ width: "100%" }} className="mb-5 gap-4">
          <div style={{ width: "100%" }} className="form-control">
            <label className="label">
              <span className="label-text text-white">What is your name?</span>
            </label>
            <label
              className={`input-group ${!validName ? "input-invalid " : ""}`}
            >
              <span
                style={{ width: "33%" }}
                className="label-info-text flex justify-between pr-1"
              >
                <div>Name</div>
                <div className="self-center">
                  {validName && user?.name === nameInput && "✅"}
                </div>
              </span>
              <input
                style={{ width: "67%" }}
                type="text"
                maxLength={30}
                disabled={isLoading}
                value={nameInput || ""}
                onBlur={onNameInputBlur}
                onChange={(e) => {
                  setIsNameValid(true);
                  setNameInput(e.target.value);
                }}
                className="input-bordered input"
              />
            </label>
            <label className="label">
              <span className="label-text text-white">
                When players needs to reach you quickly
              </span>
            </label>
            <label
              className={`input-group ${!isPhoneValid ? "input-invalid " : ""}`}
            >
              <span
                style={{ width: "33%" }}
                className="label-info-text flex justify-between pr-1"
              >
                <div>Phone</div>
                <div className="self-center">
                  {!phoneInput?.length
                    ? "🟠"
                    : validPhone && user?.phone
                    ? "✅"
                    : ""}
                </div>
              </span>
              <input
                style={{ width: "67%" }}
                type="tel"
                className="input-bordered input"
                disabled={isLoading}
                value={phoneInput || ""}
                onBlur={onPhoneInputBlur}
                onChange={(e) => {
                  setIsPhoneValid(true);
                  setPhoneInput(e.target.value);
                }}
              />
            </label>
            <label className="label">
              <span className="label-text text-white">
                Your email (can not be changed)
              </span>
            </label>
            <label className="input-group">
              <span
                style={{ width: "33%" }}
                className="label-info-text flex justify-between pr-1"
              >
                <div>E-mail</div>
                <div className="self-center">✅</div>
              </span>
              <input
                disabled
                style={{ width: "67%" }}
                type="text"
                value={user?.email as string}
                className="input-bordered input"
              />
            </label>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 self-center">
          <button
            disabled={!hasContactInfoChanged || !validPhone || !validName}
            className={`btn btn-md text-white ${
              hasContactInfoChanged
                ? validName
                  ? "btn-success animate-pulse"
                  : "btn-success"
                : ""
            }`}
            onClick={() => {
              if (nameInput && validName && nameInput !== user?.name) {
                try {
                  mutateName(
                    { name: nameInput },
                    {
                      onSuccess: () => {
                        renderToast(`Name updated.`);
                        void refetchUser();
                      },
                    }
                  );
                } catch (error) {}
              }

              if (validPhone && phoneInput !== user?.phone) {
                try {
                  mutatePhone(
                    { number: phoneInput || "" },
                    {
                      onSuccess: () => {
                        renderToast(`Phone updated.`);
                        void refetchUser();
                      },
                    }
                  );
                } catch (error) {}
              }
            }}
          >
            Save changes
          </button>
          {isLoadingPhoneMutation && <BeatLoader color="#36d7b7" size={10} />}
        </div>
      </div>
    </div>
  );
};
