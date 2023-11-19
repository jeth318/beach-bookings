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

  return [{ id: "public", name: "No group" }, ...mapped];
};
