import { type Booking, type User } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
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

  type Consent = (typeof consentList)[number];
  const allConsents = [...consentList] as Consent[];

  const [emailConsents, setEmailConsents] = useState<Consent[]>();
  const [toastMessage, setToastMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const session = useSession();

  const emailConsentsMutation = api.user.updateEmailConsents.useMutation();
  const {
    data: user,
    refetch: refetchUser,
    isInitialLoading: isInitialLodaingUser,
    isRefetching: isRefetchingUser,
  } = api.user.get.useQuery();

  useEffect(() => {
    if (emailConsents === undefined) {
      setEmailConsents(user?.emailConsents as Consent[]);
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
        return "booking-added.svg";
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

  const updateConsent = (consentToUpdate: Consent) => {
    setIsLoading(true);
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
            renderToast(`Email consents were saved.`);
            setIsLoading(false);
            setEmailConsents(emailConsents);
            void refetchUser();
          },
        }
      );
    }
  };

  return (
    <div className="settings-container bg-gradient-to-b from-[#01797391] to-[#000000] p-1">
      {toastMessage && <Toast body={toastMessage} />}
      <div className="flex flex-col justify-center text-center">
        <div className="pb-5 pt-2 text-xl text-white">
          <strong>Select e-mail notifications 📥</strong>
        </div>
      </div>
      {!user ||
      emailConsents === undefined ||
      isInitialLodaingUser ||
      isInitialLodaingUser ? (
        <div className="flex justify-center">
          <BeatLoader size={20} color="#36d7b7" />
        </div>
      ) : (
        session.status === "authenticated" &&
        allConsents?.map((consent) => {
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
              <div className="self-center pr-2" style={{ textAlign: "center" }}>
                <label>
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    className={`toggle-success toggle`}
                    onChange={() => updateConsent(consent)}
                    checked={emailConsents.includes(consent)}
                  />
                </label>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
