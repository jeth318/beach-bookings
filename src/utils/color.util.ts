
export const getBgColor = (path: string) => {
    const history = path === "/history";
    const joined = path === "/joined";
    const created = path === "/created";

    if (joined) {
        return "from-[#007621a6] to-[#000000]";
    }

    if (created) {
        return "from-[#02968f91] to-[#000000]";
    }

    if (history) {
        return "from-[#5c5e5f] to-[#000000]";
    }

    return "from-[#2c0168] to-[rgb(23,1,61)]"
}