import { api } from "~/utils/api";
import ActionModal from "./ActionModal";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { BeatLoader } from "react-spinners";
import { useState } from "react";

export const AccountControl = () => {
  const { mutate: mutateUserDelete } = api.user.delete.useMutation();
  const { data: upcomingBookingsCreated } =
    api.booking.getUpcomingForUser.useQuery();
  const { data: upcomingBookingsJoined } =
    api.booking.getJoinedUpcoming.useQuery();

  const [isLoading, setIsLoading] = useState<boolean>();

  const onAccountDelete = () => {
    setIsLoading(true);

    mutateUserDelete(undefined, {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSuccess: async () => {
        await signOut({ callbackUrl: "/" });
      },
      onError: () => {
        setIsLoading(false);
        alert(
          "Something went wrong trying to remove the account. Either try again later or contact me at admin@beachbookings.se and I'll check it out."
        );
      },
      onSettled: () => {
        setIsLoading(false);
      },
    });
  };

  const leaveJoinedBookingsDialogue = (
    <div>
      {!!upcomingBookingsJoined?.length && (
        <ul>
          <>
            <Link href="/joined" className="link text-blue-600">
              <h3>Upcoming joined bookings</h3>
            </Link>
            {upcomingBookingsJoined?.map((booking) => {
              return (
                <li key={booking.id}>
                  {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
                </li>
              );
            })}
          </>
        </ul>
      )}

      {!!upcomingBookingsCreated?.length && (
        <ul>
          <Link href="/created" className="link text-blue-600">
            <h3>Upcoming bookings published by me</h3>
          </Link>
          {upcomingBookingsCreated?.map((booking) => {
            return (
              <li key={booking.id}>
                {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  const removeAccountDialogue = (
    <div>
      <p className="mb-2 mt-2">
        This action will remove your account data from the Beach Bookings
        database (email, phone and name).
      </p>
      <p>
        Later, if you feel like re-joining, simply log in again using one of the
        login methods and your back on track with a brand new account.
      </p>
    </div>
  );

  return (
    <div>
      <ActionModal
        callback={onAccountDelete}
        data={null}
        tagRef={`remove-account`}
        title={
          !!upcomingBookingsJoined?.length || upcomingBookingsCreated?.length
            ? "Unfinished business 🚫"
            : "Tiiime tooo say goodbye 🎶🥲"
        }
        confirmButtonText={`Remove account`}
        cancelButtonText={
          !!upcomingBookingsJoined?.length || upcomingBookingsCreated?.length
            ? "CLOSE"
            : "STAY AROUND"
        }
        level={"error"}
        hideConfirm={
          !!upcomingBookingsJoined?.length || !!upcomingBookingsCreated?.length
        }
      >
        {!!upcomingBookingsJoined?.length ||
        !!upcomingBookingsCreated?.length ? (
          <>
            <h3 className="text-sm">
              You have got some bookings that you need to leave or remove before
              you can say goodbye.
            </h3>
            {leaveJoinedBookingsDialogue}
          </>
        ) : (
          removeAccountDialogue
        )}
      </ActionModal>
      <div className="mb-20 mt-5 flex flex-col items-center justify-center">
        <label
          htmlFor="action-modal-remove-account"
          className="btn-outline btn btn-error btn-ghost btn-sm"
        >
          Remove account
        </label>
        {isLoading ? (
          <BeatLoader className="mt-2" color="red" size={20} />
        ) : (
          <span style={{ height: "32px" }} />
        )}
      </div>
    </div>
  );
};
