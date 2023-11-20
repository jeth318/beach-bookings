import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { CustomIcon } from "./CustomIcon";
import { useRouter } from "next/router";
import { menuItems, type DropdownItem } from "~/utils/general.util";
import { CircleLoader } from "react-spinners";
import { useEffect, useState } from "react";
import ActionModal from "./ActionModal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Toast } from "./Toast";
import { DynamicSvg } from "~/components/DynamicSvg";

export const Header = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [invalidUseragent, setInvalidUseragent] = useState<boolean>(false);
  const avatar = sessionData?.user.image;
  const [toastMessage, setToastMessage] = useState<string>();

  const router = useRouter();

  const noBoxShadow = router.asPath !== "/";

  const renderToast = (body: string) => {
    setToastMessage(body);
    setTimeout(() => {
      setToastMessage(undefined);
    }, 3000);
  };

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

  useEffect(() => {
    if (navigator.userAgent.toUpperCase().includes("FBAN")) {
      setInvalidUseragent(true);
    }
  }, []);

  return (
    <div
      className={`navbar sticky top-0 z-50  bg-white dark:bg-slate-900 ${
        noBoxShadow ? "" : "shadow-md shadow-black"
      }`}
    >
      <ActionModal
        level="info"
        callback={() => null}
        tagRef="bad-useragent"
        title="Oh 💩, the Facebook web-browser"
        hideConfirm
        cancelButtonText="Close"
      >
        <div>
          <p className="pt-3">
            It looks like you arrived to Beach Bookings from within the
            Facebook/Messenger app. Unfortunately, Google does not allow sign
            ins from embedded browsers.
          </p>
          <p className="pt-3">
            In order to login to Beach Bookings, <br /> 👉
            <CopyToClipboard
              text={"https://beachbookings.se"}
              onCopy={() => {
                renderToast(`https://beachbookings.se copied to clipboard.`);
              }}
            >
              <button className="btn btn-success btn-xs ml-2 mr-2 self-end text-white">
                copy the link
              </button>
            </CopyToClipboard>
            👈 <br />
            and open it in your phones regular web-browser such as Safari och
            Chrome instead.
          </p>
          <br />
        </div>
      </ActionModal>
      <div className="navbar-start">
        <>
          {/*           {sessionStatus === "unauthenticated" && (
            <Link
              href={"/help"}
              className="btn-info btn-sm btn self-end text-white"
            >
              How to
            </Link>
          )} */}

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
                className="btn btn-ghost btn-circle"
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
                className="btn btn-ghost btn-circle avatar"
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
                    <DynamicSvg
                      name="settings"
                      height="25px"
                      width="25px"
                      stroke={"stroke-black dark:stroke-[#A6ADBB]"}
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
                    <DynamicSvg
                      name="how-to"
                      height="25px"
                      width="25px"
                      stroke={"stroke-black dark:stroke-[#A6ADBB]"}
                    />
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
                    onClick={() => void signOut({ callbackUrl: "/" })}
                  >
                    <DynamicSvg
                      name="log-out"
                      height="25px"
                      width="25px"
                      stroke={"stroke-black dark:stroke-[#A6ADBB]"}
                    />
                    Log out
                  </a>
                </li>
              </ul>
            </div>
          </>
        ) : (
          sessionStatus === "unauthenticated" && (
            <div className="flex">
              {toastMessage && <Toast body={toastMessage} />}
              {invalidUseragent ? (
                <label
                  className="btn-outline btn btn-sm self-end"
                  htmlFor="action-modal-bad-useragent"
                >
                  Login
                </label>
              ) : (
                <button
                  onClick={() => void signIn()}
                  className="btn-outline btn btn-sm self-end"
                >
                  Login
                </button>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
