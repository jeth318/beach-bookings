import { useEffect, useState } from "react";
import { BeatLoader, SkewLoader } from "react-spinners";
import { api } from "~/utils/api";
import { Toast } from "./Toast";
import { CustomIcon } from "./CustomIcon";
import { useSession } from "next-auth/react";
import { type EventType } from "~/utils/booking.util";

export const EmailConsents = () => {
  const consentList = [
    "ADD",
    "DELETE",
    "MODIFY",
    "JOIN",
    "LEAVE",
    "KICK",
  ] as const;

  const [internalConsentState, setInternalConsentState] = useState<string[]>(
    []
  );

  type Consent = (typeof consentList)[number];
  const allConsents = [...consentList] as Consent[];

  const [emailConsents, setEmailConsents] = useState<Consent[]>();

  const [toastMessage, setToastMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);
  const [consentToUpdate, setConsentToUpdate] = useState<number>();

  const session = useSession();
  const emailConsentsMutation = api.user.updateEmailConsents.useMutation();
  const {
    data: user,
    refetch: refetchUser,
    isInitialLoading: isInitialLodaingUser,
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

  const friendlyConsentName = {
    ADD: {
      name: "Booking added",
      description: "When a player add a new booking",
    },
    DELETE: {
      name: "Booking removed",
      description: "When you are in a booking that gets removed",
    },
    MODIFY: {
      name: "Booking updated",
      description: "When you are in a booking that gets changed",
    },
    JOIN: {
      name: "Player joined",
      description: "When a player joins your party",
    },
    LEAVE: {
      name: "Player left",
      description: "When a player leaves your party",
    },
    KICK: {
      name: "Player kicked",
      description: "When a player is kicked from your party",
    },
    CANCELED: {
      name: "Not implemented",
      description: "No info",
    },
  };

  const getConsentIcon = (consent: EventType) => {
    switch (consent) {
      case "ADD":
        return `booking-added.svg`;
      case "DELETE":
        return "booking-removed.svg";
      case "MODIFY":
        return "booking-modified.svg";
      case "JOIN":
        return "user-joined.svg";
      case "LEAVE":
        return "user-left.svg";
      case "KICK":
        return "user-kicked.svg";
      default:
        return "/";
    }
  };

  const toggleAll = (value: boolean) => {
    console.log("TOGGLE ALL");

    setIsLoadingAll(true);
    setInternalConsentState(value ? allConsents : []);
    mutateConsents(value ? allConsents : []);
  };

  const updateConsent = (consentToUpdate: Consent, index: number) => {
    index && setIsLoading(true);
    setConsentToUpdate(index);
    console.log({ consentToUpdate });
    console.log({ internalConsentState });
    console.log({ isLoadingAll });

    if (internalConsentState.indexOf(consentToUpdate) > -1) {
      console.log(
        "Existing! New internal state",
        internalConsentState.filter((c) => c !== consentToUpdate)
      );

      setInternalConsentState(
        internalConsentState.filter((c) => c !== consentToUpdate)
      );
    } else {
      console.log("Not existing! New internal state", [
        ...internalConsentState,
        consentToUpdate,
      ]);
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
            setIsLoading(false);
            setIsLoadingAll(false);
            setConsentToUpdate(undefined);
          },
        }
      );
    }
  };

  return (
    <div className="settings-container smooth-render-in-slower bg-gradient-to-b from-[#01797391] to-[#000000] p-1">
      {toastMessage && <Toast body={toastMessage} />}
      <div className="flex flex-col justify-center text-center">
        <div className="pb-5 pt-2 text-xl text-white">
          <strong>Select e-mail notifications 📥</strong>
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
      {!user || emailConsents === undefined || isInitialLodaingUser ? (
        <div className="flex justify-center">
          <BeatLoader size={20} color="#36d7b7" />
        </div>
      ) : (
        session.status === "authenticated" &&
        allConsents?.map((consent, index) => {
          return (
            <div
              key={consent}
              style={{ borderRadius: "0.5rem", marginBottom: "5px" }}
              className="flex flex-row justify-between bg-slate-200 p-2 dark:bg-slate-800"
            >
              <div className="flex items-center space-x-3">
                <div className="avatar">
                  <div className="mask mask-squircle h-12 w-12">
                    <CustomIcon
                      height={100}
                      width={100}
                      path={`/svg/${getConsentIcon(consent as EventType)}`}
                    />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      overflow: "hidden",
                      maxWidth: "150px",
                      textOverflow: "ellipsis",
                    }}
                    className="font-bold"
                  >
                    {friendlyConsentName[consent].name}
                  </div>
                  <div
                    className="text-sm opacity-50"
                    style={{
                      overflow: "hidden",
                      maxWidth: "150px",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {friendlyConsentName[consent].description}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {consentToUpdate === index && (
                  <BeatLoader size={10} color="purple" />
                )}
                <div
                  className="self-center pl-2 pr-2"
                  style={{ textAlign: "center" }}
                >
                  <label>
                    <input
                      type="checkbox"
                      className={`toggle-success toggle toggle-lg`}
                      onChange={() => updateConsent(consent, index)}
                      checked={internalConsentState.indexOf(consent) > -1}
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
