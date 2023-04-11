import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { CustomIcon } from "./CustomIcon";
import { useEffect, useState } from "react";

type Props = {
  noBoxShadow?: boolean;
  isInitialLoading?: boolean;
};

export const Header = ({ noBoxShadow }: Props) => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const avatar = sessionData?.user.image;

  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  useEffect(() => {
    toggleDropdown(dropdownVisible);
  }, [dropdownVisible]);

  const toggleDropdown = (value: boolean) => {
    const dropdownElement = document.getElementById("burger-dropdown");
    const classList = dropdownElement?.classList;
    const hasHiddenClass = classList?.contains("hidden");

    if (value && hasHiddenClass) {
      dropdownElement?.classList.remove("hidden");
    } else if (!value && !hasHiddenClass) {
      dropdownElement?.classList.add("hidden");
    }
  };

  return (
    <div
      className={`navbar sticky top-0 z-50  bg-white dark:bg-slate-900 ${
        noBoxShadow ? "" : "shadow-md shadow-black"
      }`}
    >
      <div className="navbar-start">
        <>
          <Link
            className="smooth-render-in-slower hidden text-lg md:hidden lg:flex"
            href="/"
          >
            🏐 ßeach ßookings 🏖️
          </Link>
          {sessionStatus === "authenticated" && (
            <div
              className={`dropdown z-50 text-lg lg:hidden ${
                sessionStatus === "authenticated"
                  ? "smooth-render-in-slower"
                  : ""
              }`}
            >
              <label
                onClick={() => {
                  setDropdownVisible(true);
                }}
                tabIndex={0}
                className="btn-ghost btn-circle avatar btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                id="burger-dropdown"
                className="dropdown-content menu rounded-box menu-compact mt-3 w-40 bg-base-100 p-2 shadow-md shadow-stone-900"
              >
                <li>
                  <Link
                    href="/booking"
                    className="tex p-1 text-xl"
                    onClick={() => setDropdownVisible(false)}
                  >
                    <CustomIcon path="/svg/add-circle.svg" />
                    New
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="p-1 text-xl"
                    onClick={() => setDropdownVisible(false)}
                  >
                    <CustomIcon path="/svg/home.svg" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => setDropdownVisible(false)}
                    className="p-1 text-xl"
                    href="/joined"
                  >
                    <CustomIcon path="/svg/handshake.svg" />
                    Joined
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => setDropdownVisible(false)}
                    className="p-1 text-xl"
                    href="/created"
                  >
                    <CustomIcon path="/svg/crown.svg" width={17} />
                    Booked
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => setDropdownVisible(false)}
                    className="p-1 text-xl"
                    href="/history"
                  >
                    <CustomIcon path="/svg/history.svg" width={17} />
                    History
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </>
      </div>
      <div className="navbar-center">
        <Link className="text-lg lg:hidden" href="/">
          🏐 ßeach ßookings 🏖️
        </Link>
      </div>
      <div className="navbar-end">
        {sessionData?.user?.id ? (
          <>
            <div className="smooth-render-in-slower navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-5">
                <li>
                  <Link href="/booking" className="gap-1 p-2">
                    <CustomIcon path="/svg/add-circle.svg" />
                    Add booking
                  </Link>
                </li>
                <li>
                  <Link className="gap-2 p-2" href="/">
                    <CustomIcon path="/svg/home.svg" />
                    All
                  </Link>
                </li>
                <li>
                  <Link className="gap-2 p-2" href="/joined">
                    <CustomIcon path="/svg/handshake.svg" />
                    Joins
                  </Link>
                </li>
                <li>
                  <Link className="gap-2 p-2" href="/created">
                    <CustomIcon path="/svg/bookings-white.svg" />
                    My bookings
                  </Link>
                </li>
                <li>
                  <Link className="gap-2 p-2" href="/history">
                    <CustomIcon path="/svg/history.svg" width={15} />
                    History
                  </Link>
                </li>
              </ul>
            </div>
            <div className="dropdown dropdown-end z-50">
              <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
                <div className="w-9 rounded-full">
                  <Image
                    height={100}
                    width={100}
                    alt="user-icon-default"
                    src={avatar || "/user-default.png"}
                  />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu rounded-box menu-compact z-50 mt-3 w-32 bg-base-100 p-2 shadow-md shadow-black"
              >
                <li>
                  <a
                    className="whitespace-nowrap p-1 text-lg"
                    onClick={() => void signOut()}
                  >
                    <svg
                      width="25px"
                      height="25px"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="Interface / Log_Out">
                        <path
                          id="Vector"
                          d="M12 15L15 12M15 12L12 9M15 12H4M9 7.24859V7.2002C9 6.08009 9 5.51962 9.21799 5.0918C9.40973 4.71547 9.71547 4.40973 10.0918 4.21799C10.5196 4 11.0801 4 12.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H12.1969C11.079 20 10.5192 20 10.0918 19.7822C9.71547 19.5905 9.40973 19.2839 9.21799 18.9076C9 18.4798 9 17.9201 9 16.8V16.75"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    </svg>
                    Log out
                  </a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          sessionStatus === "unauthenticated" && (
            <div className="smooth-render-in-slower">
              <button
                onClick={() => void signIn()}
                className="btn-outline btn-sm btn self-end"
              >
                Login
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};
