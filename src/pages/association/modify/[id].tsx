import { type ChangeEvent, useState, useEffect } from "react";
import { SubHeader } from "~/components/SubHeader";
import { useSession } from "next-auth/react";
import ActionModal from "~/components/ActionModal";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/router";
import { parseErrorMessage } from "~/utils/error.util";
import useSingleAssociation from "~/hooks/useSingleAssociation";
import {
  associationToastMessages,
  getQueryId,
  renderToast,
} from "~/utils/general.util";
import { PageLoader } from "~/components/PageLoader";
import useUser from "~/hooks/useUser";
import { Toast } from "~/components/Toast";
import { JoinableToggle } from "~/components/JoinableToggle";
import MainContainer from "~/components/MainContainer";

const ModifyAssociation = () => {
  const session = useSession();
  const router = useRouter();
  const { user, refetchUser } = useUser({ email: session?.data?.user.email });
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>();
  const { association, updateAssociation } = useSingleAssociation({
    associationId: getQueryId(router),
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>();

  const descriptionMaxLength = 200;

  const charsRemaining = description?.length
    ? descriptionMaxLength - description?.length
    : descriptionMaxLength;

  const validName = name?.length && name?.length > 3 && !errorMessage;

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");
    setName(event.target.value);
    return null;
  };

  useEffect(() => {
    if (association?.id) {
      setName(association.name);
      setDescription(association.description || "");
    }
  }, [association]);

  if (!association || session.status === "loading") {
    return (
      <>
        <SubHeader title="Groups" />
        <PageLoader />
      </>
    );
  }

  const onSaveChangesClicked = async () => {
    if (!validName || !user || !association?.id) {
      return null;
    }

    setIsLoading(true);
    try {
      await updateAssociation({ id: association?.id, name, description });
      await refetchUser();
      renderToast(associationToastMessages.MODIFY, setToastMessage);
    } catch (error) {
      if (parseErrorMessage(error).includes("Unique constraint")) {
        setErrorMessage("Group name already exists. Try another.");
      }
    }
    setIsLoading(false);
  };

  const hasAnythingChanged =
    name !== association.name || description !== association.description;

  const bgFrom = "#a31da1";
  const bgTo = "#15162c";
  return (
    <div>
      {toastMessage && <Toast body={toastMessage} />}
      <SubHeader title="Modify group information" />
      <MainContainer bgFrom={bgFrom} bgTo={bgTo}>
        <div className="p-4">
          <div style={{ width: "100%" }} className="mb-5 mt-10 gap-4">
            <div style={{ width: "100%" }} className="form-control">
              <label className="flex-start label flex flex-col items-start">
                <span className="label-text ">
                  What should this group be called?
                </span>
              </label>
              <label className={`${!validName ? "input-invalid " : ""}`}>
                <input
                  style={{ width: "100%" }}
                  type="text"
                  maxLength={30}
                  value={name || ""}
                  onChange={onNameChange}
                  className="input-bordered input"
                />
              </label>
              {errorMessage && (
                <span className="label-text mt-2 self-center rounded-md text-error">
                  {errorMessage || "Group name already exists"}
                </span>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text ">
                  A short description about this group
                </span>
                <span className="label-text-alt ">{charsRemaining}</span>
              </label>
              <textarea
                maxLength={200}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea-bordered textarea h-24"
                value={description}
              ></textarea>
            </div>
            <div className="mt-10 flex justify-center">
              <div className="flex flex-col items-center">
                <button
                  disabled={!validName || !hasAnythingChanged}
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={onSaveChangesClicked}
                  className={`btn-success btn flex min-w-[150px] flex-col items-center`}
                >
                  {isLoading ? (
                    <BeatLoader size={12} color="white" />
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
};

export default ModifyAssociation;
