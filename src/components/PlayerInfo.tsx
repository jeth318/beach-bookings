import { useState, type ChangeEvent, useEffect } from "react";
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

  const [phoneInput, setPhoneInput] = useState<string | null>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    user?.phone || null
  );

  const [nameInput, setNameInput] = useState<string | null>(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    user?.name || null
  );

  const phoneRegexPattern = new RegExp(
    "^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$"
  );

  const [isNameValid, setIsNameValid] = useState<boolean>(true);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true);

  const isLoading = isLoadingPhoneMutation || isLoadingNameMutation;

  const validPhone =
    !phoneInput ||
    (phoneInput?.length > 2 && phoneRegexPattern.test(phoneInput));

  const validName = !!(
    nameInput &&
    nameInput?.length > 2 &&
    nameInput.length <= 30
  );

  console.log({ validPhone });

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

  const onNameInputBlur = (event: ChangeEvent<HTMLInputElement>) => {
    setIsNameValid(validName);
    if (event.target.value.length < 3) {
      console.log("Too short");
      setIsNameValid(false);
      return null;
    }

    if (event.target.value.length > 30) {
      console.log("Too long");
      setIsNameValid(false);
      return null;
    }

    setNameInput(event.target.value);

    if (nameInput && validName) {
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
  };

  const onPhoneInputBlur = (event: ChangeEvent<HTMLInputElement>) => {
    setIsPhoneValid(validPhone);
    if (event.target.value.length < 3) {
      return "";
    }
    setPhoneInput(event.target.value);
    if (validPhone) {
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
  };

  return (
    <>
      {toastMessage && <Toast body={toastMessage} />}
      <div className="flex flex-col justify-center text-center">
        <div className="mb-2 mt-10 text-xl text-white">
          <strong>Player information</strong>
        </div>
      </div>
      <div style={{ width: "100%" }} className="flex max-w-md justify-center">
        <div style={{ width: "100%" }} className="mb-4 gap-4 p-2">
          <div style={{ width: "100%" }} className="form-control">
            <label className="label">
              <span className="label-text text-white">What is your name?</span>
              {isLoadingNameMutation && (
                <BeatLoader color="#36d7b7" size={15} />
              )}
            </label>
            <label
              className={`input-group ${!validName ? "input-invalid " : ""}`}
            >
              <span
                style={{ width: "25%" }}
                className="label-info-text flex justify-between pr-1"
              >
                <div>Name</div>
                <div className="self-center">{validName && "✅"}</div>
              </span>
              <input
                style={{ width: "75%" }}
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
              {isLoadingPhoneMutation && (
                <BeatLoader color="#36d7b7" size={15} />
              )}
            </label>
            <label
              className={`input-group ${!isPhoneValid ? "input-invalid " : ""}`}
            >
              <span
                style={{ width: "25%" }}
                className="label-info-text flex justify-between pr-1"
              >
                <div>Phone</div>
                <div className="self-center">
                  {!phoneInput?.length ? "🔶" : validPhone ? "✅" : ""}
                </div>
              </span>
              <input
                style={{ width: "75%" }}
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
                style={{ width: "25%" }}
                className="label-info-text flex justify-between pr-1"
              >
                <div>E-mail</div>
                <div className="self-center">✅</div>
              </span>
              <input
                disabled
                style={{ width: "75%" }}
                type="text"
                value={user?.email as string}
                className="input-bordered input"
              />
            </label>
          </div>
        </div>
      </div>
    </>
  );
};
