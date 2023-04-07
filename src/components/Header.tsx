import { signIn, signOut, useSession } from "next-auth/react";

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="test-3xl flex-1 pl-5 font-bold">
        {sessionData?.user.name
          ? `Yo, ${sessionData.user.name}`
          : "Beach bookings"}
      </div>
      <button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
        className="btn-add btn-sm btn font-bold text-white"
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
