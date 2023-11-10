import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { api } from "~/utils/api";
import { Toast } from "./Toast";
import { CustomIcon } from "./CustomIcon";
import { useSession } from "next-auth/react";
import { type EventType } from "~/utils/booking.util";
import {
  type Consent,
  consentList,
  friendlyConsentName,
  getConsentIcon,
} from "~/utils/consent.util";
import { DynamicSvg } from "./DynamicSvg";

export const EmailConsents = () => {
  const [internalConsentState, setInternalConsentState] = useState<string[]>(
    []
  );

  const allConsents = [...consentList] as Consent[];

  const [emailConsents, setEmailConsents] = useState<Consent[]>();
  const [toastMessage, setToastMessage] = useState<string>();
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);
  const [consentToUpdate, setConsentToUpdate] = useState<number>();

  const session = useSession();
  const emailConsentsMutation = api.user.updateEmailConsents.useMutation();
  const {
    data: user,
    refetch: refetchUser,
    isInitialLoading: isInitialLoadingUser,
  } = api.user.get.useQuery();

  useEffect(() => {
    if (emailConsents === undefined) {
      setEmailConsents(user?.emailConsents as Consent[]);
      setInternalConsentState(user?.emailConsents || []);
    }
  }, [emailConsents, session?.data?.user.id, user?.emailConsents]);

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

  const toggleAll = (value: boolean) => {
    setIsLoadingAll(true);
    setInternalConsentState(value ? allConsents : []);
    mutateConsents(value ? allConsents : []);
  };

  const updateConsent = (consentToUpdate: Consent, index: number) => {
    setConsentToUpdate(index);

    if (internalConsentState.indexOf(consentToUpdate) > -1) {
      setInternalConsentState(
        internalConsentState.filter((c) => c !== consentToUpdate)
      );
    } else {
      setInternalConsentState([...internalConsentState, consentToUpdate]);
    }

    let updatedConsents = emailConsents;
    if (emailConsents?.includes(consentToUpdate)) {
      updatedConsents = emailConsents.filter(
        (consent) => consent !== consentToUpdate
      );
    } else {
      updatedConsents = [...(emailConsents || []), consentToUpdate];
    }
    mutateConsents(updatedConsents);
  };

  const mutateConsents = (emailConsents: Consent[]) => {
    if (emailConsents !== undefined) {
      void emailConsentsMutation.mutate(
        {
          emailConsents,
        },
        {
          onSuccess: () => {
            renderToast(`Email preferences saved.`);
            setEmailConsents(emailConsents);
            void refetchUser();
          },
          onSettled: () => {
            setIsLoadingAll(false);
            setConsentToUpdate(undefined);
          },
        }
      );
    }
  };

  return (
    <div style={{ width: "100%" }} className="settings-container">
      {toastMessage && <Toast body={toastMessage} />}
      <div className="flex flex-col justify-center text-center">
        <div className="pb-5  text-xl text-white">
          <strong>Select email notifications 📥</strong>
        </div>
      </div>
      <div className="flex items-center justify-center pb-4">
        <button className="btn-sm btn" onClick={() => toggleAll(true)}>
          All! 🍭
        </button>
        <BeatLoader
          className="pl-3 pr-3"
          style={{
            visibility: !isLoadingAll ? "hidden" : "inherit",
          }}
          size={10}
          color="white"
        />
        <button className="btn-sm btn" onClick={() => toggleAll(false)}>
          None ✋
        </button>
      </div>
      {!user || emailConsents === undefined || isInitialLoadingUser ? (
        <div className="flex justify-center" style={{ minHeight: "600px" }}>
          <BeatLoader size={20} color="#36d7b7" />
        </div>
      ) : (
        session.status === "authenticated" &&
        allConsents?.map((consent, index) => {
          const consentIdentifier = getConsentIcon(consent as EventType);
          return (
            <div
              key={consent}
              style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
              className="smooth-render-in flex flex-row justify-between bg-slate-200 p-2 dark:bg-slate-800"
            >
              <div className="flex items-center space-x-2">
                <div className="avatar">
                  <div className="mask h-10 w-10">
                    <DynamicSvg
                      name={consentIdentifier}
                      height="50px"
                      width="50px"
                      stroke="stroke-black dark:stroke-[#A6ADBB]"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-bold">
                    {friendlyConsentName[consent].name}
                  </div>
                  <div
                    className="text-sm opacity-60"
                    style={{
                      overflow: "hidden",
                      maxWidth: "150px",
                      textOverflow: "n",
                    }}
                  >
                    {friendlyConsentName[consent].description}
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
                      onChange={() => updateConsent(consent, index)}
                      checked={internalConsentState.indexOf(consent) > -1}
                    />
                  </label>
                </div>
                {consentToUpdate === index ? (
                  <div className="self-center ">
                    <BeatLoader size={10} color="purple" />
                  </div>
                ) : (
                  <div style={{ height: "24px" }}></div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
