import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  const { data: sessionData } = useSession();

  const avatar = sessionData?.user.image;

  return (
    <div className="navbar sticky top-0 z-50 bg-white ">
      <div className="navbar-start">
        <Link className="text-lg text-black" href="/">
          🏐 ßeach ßookings 🏖️
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/booking">Add booking</Link>
          </li>

          {/*<li>
            <a>Booked by me</a>
          </li>
          <li>
            <a>Joined games</a>
  </li>*/}

          <li>
            <a
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "Logout" : "Login"}
            </a>
          </li>
        </ul>
      </div>
      {sessionData !== undefined && (
        <div className="navbar-end">
          {sessionData?.user.id ? (
            <div className="dropdown-end dropdown">
              <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
                <div className="w-10 rounded-full">
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
                className="dropdown-content menu rounded-box menu-compact mt-3 w-36 bg-base-100 p-2 shadow"
              >
                <li>
                  <Link href="/booking">New booking</Link>
                </li>

                {/*<li>
                  <a>Booked by me</a>
                </li>
                <li>
                  <a>Joined games</a>
          </li>*/}
                <li>
                  <a onClick={() => void signOut()}>Logout</a>
                </li>
              </ul>
            </div>
          ) : (
            <button
              onClick={() => void signIn()}
              className="btn-outline btn-sm btn self-end text-black"
            >
              Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};
