import { type Facility } from "@prisma/client";

export const getFacilitiesToShow = (facilities?: Facility[]) =>
  facilities
    ?.filter((facility) => facility.id === "1")
    .map((facility) => ({
      id: facility.id,
      name: facility.name,
    })) || [];

export const getFacility = (id: string | null, facilities?: Facility[]) => {
  return facilities?.find((item) => item.id === id);
};
