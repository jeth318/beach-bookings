import { useState, type ChangeEvent } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "~/utils/api";
import { Toast } from "./Toast";
import { type User } from "@prisma/client";

type Props = {
  user?: User;
};

export const RegisterUserInfo = ({ user }: Props) => {
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

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

  const onNameInputBlur = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length < 3) {
      console.log("Too short");

      return "";
    }
    console.log("Lets goo");

    setNameInput(event.target.value);

    if (nameInput && nameInput?.length > 2 && nameInput !== user?.name) {
      try {
        mutateName(
          { name: nameInput },
          {
            onSuccess: () => {
              renderToast(`Display name was updated.`);
              void refetchUser();
            },
          }
        );
      } catch (error) {}
    }
  };

  const onPhoneInputBlur = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length < 3) {
      console.log("Too short");

      return "";
    }
    console.log("Lets goo");

    setPhoneInput(event.target.value);

    if (phoneInput && phoneInput?.length > 2 && phoneInput !== user?.phone) {
      try {
        mutatePhone(
          { number: phoneInput },
          {
            onSuccess: () => {
              renderToast(`Phone number saved.`);
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

      <div
        style={{ width: "100%" }}
        className="settings-container flex max-w-md justify-center"
      >
        <div style={{ width: "100%" }} className="mb-4 gap-4 p-2">
          <div style={{ width: "100%" }} className="form-control">
            <label className="label">
              <span className="label-text text-white">
                What would you like to be called?
              </span>
              {isLoadingNameMutation && (
                <BeatLoader color="#36d7b7" size={15} />
              )}
            </label>
            <label className="input-group">
              <span style={{ width: "35%" }}>Name</span>
              <input
                style={{ width: "65%" }}
                type="text"
                disabled={isLoadingNameMutation}
                placeholder="Hellvig"
                value={nameInput || ""}
                onBlur={onNameInputBlur}
                onChange={(e) => {
                  setNameInput(e.target.value);
                }}
                className="input-bordered input"
              />
            </label>
            <label className="label">
              <span className="label-text text-white">
                When player needs to reach you quickly:
              </span>
              {isLoadingPhoneMutation && (
                <BeatLoader color="#36d7b7" size={15} />
              )}
            </label>
            <label className="input-group">
              <span style={{ width: "35%" }}>Number</span>
              <input
                style={{ width: "65%" }}
                type="tel"
                placeholder="0705092234"
                className="input-bordered input"
                value={phoneInput || ""}
                onBlur={onPhoneInputBlur}
                onChange={(e) => {
                  setPhoneInput(e.target.value);
                }}
              />
            </label>
            <label className="label">
              <span className="label-text text-white">
                Your email (cannot be changed)
              </span>
            </label>
            <label className="input-group">
              <span style={{ width: "35%" }}>E-mail</span>
              <input
                disabled
                style={{ width: "65%" }}
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
