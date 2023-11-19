import { type ChangeEvent, useState } from "react";
import { SubHeader } from "~/components/SubHeader";
import useAssociations from "../hooks/useUserAssociations";
import { useSession } from "next-auth/react";
import ActionModal from "~/components/ActionModal";
import { BeatLoader } from "react-spinners";
import { embeddedLanguageFormatting } from "prettier.config.cjs";
import { type Association } from "@prisma/client";
import { useRouter } from "next/router";
import useUser from "../hooks/useUser";

const CreateAssociation = () => {
  const session = useSession();
  const router = useRouter();
  const { user, mutateAssociations } = useUser({
    email: session.data?.user.email || "",
  });
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { createAssociationMutation } = useAssociations(
    session.data?.user.email || ""
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const onSubmit = async () => {
    console.log(validName);

    if (validName && !!user) {
      console.log("Valid name");
      setIsLoading(true);
      try {
        await createAssociationMutation(
          {
            name,
            description: description || null,
          },

          {
            onSuccess: (association: Association) => {
              console.log("Success!");

              mutateAssociations({
                associations: [...user?.associations, association.id],
              });
              router.push(`/association/${association.id}`).catch(() => null);
            },
            onError: (e) => {
              if (e.message?.includes("Unique constraint")) {
                setErrorMessage("Group name already exists. Try another.");
              }
            },
            onSettled: () => {
              setIsLoading(false);
            },
          }
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  console.log("Name", name);

  return (
    <div>
      <ActionModal
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        callback={onSubmit}
        data={undefined}
        tagRef={`create-association`}
        title="Confirm new group 👥"
        confirmButtonText={"Create"}
        cancelButtonText="Cancel"
        level="success"
      >
        <p className="py-4">
          After your group is created. You can invite players by email.
        </p>
      </ActionModal>
      <SubHeader title="Create a group" />
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#a31da1] to-[#15162c]">
        <div className="smooth-render-in container h-screen max-w-md p-4">
          <div style={{ width: "100%" }} className="mb-5 mt-10 gap-4">
            <div style={{ width: "100%" }} className="form-control">
              <label className="flex-start label flex flex-col items-start">
                <span className="label-text text-white">
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
                <span className="label-text text-white">
                  A short description about this group
                </span>
                <span className="label-text-alt text-white">
                  {charsRemaining}
                </span>
              </label>
              <textarea
                maxLength={200}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea-bordered textarea h-24"
              ></textarea>
            </div>
            <div className="mt-10 flex justify-center">
              <div className="flex flex-col items-center">
                <label
                  className={`${
                    validName ? "btn-success" : "btn-disabled"
                  } btn text-white`}
                  htmlFor="action-modal-create-association"
                >
                  Create
                </label>
                {isLoading && (
                  <div>
                    <BeatLoader className="mt-2" size={10} color="white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAssociation;