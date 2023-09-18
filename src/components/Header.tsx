import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { CustomIcon } from "./CustomIcon";
import { useRouter } from "next/router";
import { menuItems, type DropdownItem } from "~/utils/general.util";
import { CircleLoader } from "react-spinners";

export const Header = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const avatar = sessionData?.user.image;
  const router = useRouter();

  const noBoxShadow = router.asPath !== "/";

  const toggleDropdown = (value: boolean, elementId: string) => {
    const dropdownElement = document.getElementById(elementId);

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
          {sessionStatus === "unauthenticated" && (
            <Link
              href={"/help"}
              className="btn-info btn-sm btn self-end text-white"
            >
              How to
            </Link>
          )}

          <div className="hidden pr-2 text-lg md:hidden lg:flex"></div>
          <Link className="hidden text-lg md:hidden lg:flex" href="/">
            ßeach ßookings 🏖️
          </Link>
          {sessionStatus === "authenticated" && (
            <div
              className={`dropdown z-50 text-lg lg:hidden ${
                sessionStatus === "authenticated" ? "" : ""
              }`}
            >
              <label
                onClick={() => {
                  toggleDropdown(true, "burger-dropdown");
                }}
                id="burger-dropdown-label"
                tabIndex={0}
                className="btn-ghost btn-circle btn"
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
                {menuItems.map(({ text, href, icon }: DropdownItem) => {
                  return (
                    <li key={text} className="p-1">
                      <Link
                        href={href}
                        className="tex p-1 text-xl"
                        onClick={() => toggleDropdown(false, "burger-dropdown")}
                      >
                        <CustomIcon width={25} path={`/svg/${icon}`} />
                        {text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      </div>
      <div className="navbar-center">
        <Link className="text-lg lg:hidden" href="/">
          ßeach ßookings 🏖️
        </Link>
      </div>
      <div className="navbar-end">
        {sessionStatus === "loading" && (
          <div className="pr-2">
            <CircleLoader color="purple" size={36} />
          </div>
        )}
        {sessionStatus === "authenticated" ? (
          <>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-5">
                {menuItems.map(({ text, href, icon }: DropdownItem) => {
                  return (
                    <li key={text} className="p-1">
                      <Link href={href} className="gap-2 p-2">
                        <CustomIcon width={25} path={`/svg/${icon}`} />
                        {text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="dropdown dropdown-end z-50">
              <label
                onClick={() => {
                  toggleDropdown(true, "user-dropdown");
                }}
                id="user-dropdown-label"
                tabIndex={0}
                className="btn-ghost btn-circle avatar btn"
              >
                <div className="w-9 rounded-full">
                  <CustomIcon
                    height={25}
                    width={25}
                    path={avatar || "/user-default.png"}
                  />
                </div>
              </label>
              <ul
                id="user-dropdown"
                tabIndex={0}
                className="dropdown-content menu rounded-box menu-compact z-50 mt-3 w-36 bg-base-100 p-2 shadow-md shadow-black"
              >
                <li
                  className="p-1"
                  onClick={() => {
                    toggleDropdown(false, "user-dropdown");
                  }}
                >
                  <Link
                    className="whitespace-nowrap p-1 text-lg"
                    href="/settings"
                  >
                    <CustomIcon
                      path="/svg/settings.svg"
                      width={25}
                      height={25}
                    />
                    Settings
                  </Link>
                </li>
                <li
                  className="p-1"
                  onClick={() => {
                    toggleDropdown(false, "user-dropdown");
                  }}
                >
                  <Link className="whitespace-nowrap p-1 text-lg" href="/help">
                    <CustomIcon path="/svg/help.svg" width={25} height={25} />
                    How to
                  </Link>
                </li>
                <li
                  className="p-1"
                  onClick={() => {
                    toggleDropdown(false, "user-dropdown");
                  }}
                >
                  <a
                    className="whitespace-nowrap p-1 text-lg"
                    onClick={() => void signOut()}
                  >
                    <CustomIcon path="/svg/logout.svg" width={25} height={25} />
                    Log out
                  </a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          sessionStatus === "unauthenticated" && (
            <div className="flex">
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
