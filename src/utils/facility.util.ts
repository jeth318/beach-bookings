import { type Facility } from "@prisma/client";

export const getFacilitiesToShow = (facilities?: Facility[]) =>
  facilities
    ?.filter((facility) => facility.id === "1")
    .map((facility) => ({
      id: facility.id,
      name: facility.name,
    })) || [];
