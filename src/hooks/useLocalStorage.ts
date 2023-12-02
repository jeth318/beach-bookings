import { api } from "~/utils/api";
import { getPrePopulationState } from "~/utils/storage";

const useLocalStorage = () => {
  const lss = getPrePopulationState();
  return {
    lss: {
      duration: lss?.duration,
      court: lss?.court,
      facility: lss?.facility,
      maxPlayers: lss?.maxPlayers || 4,
      association: lss?.association,
      privateBooking: lss?.privateBooking || false,
      date:
        lss?.date !== null && lss?.date !== undefined
          ? new Date(lss?.date)
          : undefined,
      time:
        lss?.time !== null && lss?.time !== undefined ? lss.time : undefined,
    },
  };
};

export default useLocalStorage;
