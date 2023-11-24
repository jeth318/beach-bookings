import { type Association } from "@prisma/client";

export const getAssociationsToShow = (
  associations?: Association[] | null | undefined
) => {
  const mapped =
    associations?.map((association) => {
      return {
        id: association.id,
        name: association.name,
      };
    }) || [];

  return mapped;
};

export const getAssociationById = (
  id?: string | null | undefined,
  associations?: Association[]
) => {
  return associations?.find((item) => item.id === id);
};
