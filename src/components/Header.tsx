import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="navbar sticky top-0 z-50 bg-white shadow-md shadow-black">
      <div className="navbar-start">
        <Link className="text-lg" href="/">
          🏐 ßeach ßookings 🏖️
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/booking">Add booking</Link>
          </li>

          <li>
            <a>Booked by me</a>
          </li>
          <li>
            <a>Joined games</a>
          </li>

          <li>
            <a
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "Logout" : "Login"}
            </a>
          </li>
        </ul>
      </div>
      {sessionData?.user.id ? (
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
              <div className="w-10 rounded-full">
                <Image
                  height={100}
                  width={100}
                  alt="user-icon-default"
                  src="/user-default.png"
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-36 bg-base-100 p-2 text-black shadow"
            >
              <li>
                <Link href="/booking">Add booking</Link>
              </li>

              <li>
                <a>Booked by me</a>
              </li>
              <li>
                <a>Joined games</a>
              </li>
              <li>
                <a
                  onClick={
                    sessionData ? () => void signOut() : () => void signIn()
                  }
                >
                  {sessionData ? "Logout" : "Login"}
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="navbar-end">
          <button
            onClick={() => void signIn()}
            className="btn-outline btn-sm btn self-end"
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
  /*return (
    <div className="navbar sticky top-0 z-50 bg-primary text-primary-content shadow-md">
      <div className="flex-1 pl-1 text-2xl font-bold">
        <Link href="/">ßeach ßookings</Link>
      </div>
      <div className="btn-group btn">
        {sessionData?.user.id && (
          <button className="btn-add btn-success btn-sm btn font-bold">
            <Link href="/booking">New booking</Link>
          </button>
        )}
        <button
          onClick={sessionData ? () => void signOut() : () => void signIn()}
          className="btn-add btn-primary btn-sm btn font-bold text-white"
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>
    </div>
  );*/
};
