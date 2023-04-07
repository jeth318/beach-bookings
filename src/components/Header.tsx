import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1 pl-1 text-2xl font-bold">Beach bookings</div>
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
  );
};
