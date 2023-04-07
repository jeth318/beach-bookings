import { useSession } from "next-auth/react";

export const Header = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="test-3xl flex-1 pl-5 font-bold">
        {sessionData?.user.name
          ? `Signed in as ${sessionData.user.name}`
          : "Beach bookings"}
      </div>
      {sessionData?.user.id ? (
        <button className="btn-success btn">Add Booking</button>
      ) : (
        <button className="btn">Sign in</button>
      )}
    </div>
  );
};
