import { api } from "~/utils/api";

const useAssociation = () => {
  const {
    mutateAsync: createAssociation,
    isSuccess: isAssociationSuccessfullyCreated,
    isError: isAssociationCreateError,
  } = api.association.create.useMutation();

  const {
    mutateAsync: deleteAssociation,
    isSuccess: isAssociationSuccessfullyDeleted,
    isError: isAssociationDeleteError,
  } = api.association.delete.useMutation();

  return {
    createAssociation,
    deleteAssociation,
    isAssociationSuccessfullyCreated,
    isAssociationSuccessfullyDeleted,
    isAssociationCreateError,
    isAssociationDeleteError,
  };
};

export default useAssociation;
