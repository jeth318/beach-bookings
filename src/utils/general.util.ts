export const getFrogText = (path: string) => {
    const history = path === "/history";
    const joined = path === "/joined";
    const created = path === "/created";   

    if (joined) {
        return `
        Ey, looking quite lonely.
        You'd better find a game to join.`
    }

    if (created) {
        return "You have no active bookings 🐸";
    }

    if (history) {
        return "No old bookings yet...";
    }

    return "No bookings found. Either we have to step it up and start playing and adding bookings, or else there is a bug somewhere in the code 🐸";
} 

export const removeBookingText = "If you remove this booking, it will be gone forever. But hey, I'm not your mommy, you are in charge"