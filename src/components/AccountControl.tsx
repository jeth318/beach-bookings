import { api } from "~/utils/api";
import ActionModal from "./ActionModal";
import Link from "next/link";

export const AccountControl = () => {
  const { mutate: mutateUserDelete } = api.user.delete.useMutation();
  const { data: bookingsCreated } = api.booking.getForUser.useQuery();
  const { data: bookingsJoined } = api.booking.getJoined.useQuery();

  const onAccountDelete = () => {
    mutateUserDelete();
  };

  console.log({ bookingsCreated, bookingsJoined });

  const leaveJoinedBookingsDialogue = (
    <div>
      <p className="mt-2">
        You are participating in upcoming bookings.{" "}
        <Link href="/joined" className="link text-blue-600">
          Check out your joined bookings
        </Link>
        , leave them, and then come back here.
      </p>

      <ul className="mt-4">
        {!!bookingsJoined?.length && (
          <>
            <h3 className="text-lg">Joined bookings</h3>
            {bookingsJoined?.map((booking) => {
              return (
                <li key={booking.id}>
                  {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
                </li>
              );
            })}
          </>
        )}
        <h3 className="text-sm">
          <strong>Upcoming bookings published by you:</strong>
        </h3>
        {bookingsCreated?.length &&
          bookingsCreated?.map((booking) => {
            return (
              <li key={booking.id}>
                {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
              </li>
            );
          })}
      </ul>
    </div>
  );

  const removeCreatedBookingsDialogue = (
    <div>
      <p className="mt-2">
        You have one or more created bookings.{" "}
        <Link href="/joined" className="link text-blue-600">
          Check out your booked upcoming games and delete them first.
        </Link>
        , leave them, and then come back here.
      </p>

      <ul className="mt-4">
        {!!bookingsJoined?.length && (
          <>
            <h3 className="text-lg">Joined bookings</h3>
            {bookingsJoined?.map((booking) => {
              return (
                <li key={booking.id}>
                  {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
                </li>
              );
            })}
          </>
        )}
        <h3 className="text-sm">
          <strong>Upcoming bookings published by you:</strong>
        </h3>
        {bookingsCreated?.length &&
          bookingsCreated?.map((booking) => {
            return (
              <li key={booking.id}>
                {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
              </li>
            );
          })}
      </ul>
    </div>
  );

  const removeAccountDialogue = (
    <div>
      <p className="mt-2">
        This action will remove your account data from the Beach Bookings
        database (email, phone and name).
      </p>
      <br />
      <p>
        Later, if you feel like re-joining, simply log in again using one of the
        login methods and your back on tracks with a new account.
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
          !!bookingsJoined?.length || bookingsCreated?.length
            ? "Cannot remove account"
            : "Is this goodbye?"
        }
        confirmButtonText={"REMOVE ACCOUNT"}
        cancelButtonText={
          !!bookingsJoined?.length || bookingsCreated?.length
            ? "CLOSE"
            : "STAY AROUND"
        }
        level={"error"}
        hideConfirm={!!bookingsJoined?.length || !!bookingsCreated?.length}
      >
        {!!bookingsJoined?.length || bookingsCreated?.length
          ? leaveJoinedBookingsDialogue
          : removeAccountDialogue}
      </ActionModal>
      <div className="mb-20 mt-5 flex justify-center">
        <label
          htmlFor="action-modal-remove-account"
          className="btn-outline btn-error btn-ghost btn-sm btn"
        >
          Remove account
        </label>
      </div>
    </div>
  );
};
