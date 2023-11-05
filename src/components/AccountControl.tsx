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

  const leaveJoinedBookingsDialogue = (
    <div>
      {!!bookingsJoined?.length && (
        <ul className="mt-4">
          <>
            <Link href="/joined" className="link text-blue-600">
              <h3>My joined bookings</h3>
            </Link>
            {bookingsJoined?.map((booking) => {
              return (
                <li key={booking.id}>
                  {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
                </li>
              );
            })}
          </>
        </ul>
      )}

      {!!bookingsCreated?.length && (
        <ul>
          <Link href="/joined" className="link text-blue-600">
            <h3>My created bookings</h3>
          </Link>
          {bookingsCreated?.map((booking) => {
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

  const removeCreatedBookingsDialogue = (
    <div>
      <p className="mt-2">
        You have one or more upcoming bookings published by you.{" "}
        <Link href="/created" className="link text-blue-600">
          Check out the games booked by you
        </Link>
        , and remove them first. Then come back here.
      </p>

      <ul className="mt-4">
        {bookingsCreated?.length &&
          bookingsCreated?.map((booking) => {
            return (
              <li key={booking.id}>
                <Link href="/created" className="link text-blue-600">
                  {`${booking.date.toLocaleDateString()} - ${booking.date.toLocaleTimeString()}`}
                </Link>
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
            ? "Unfinished business 🚫"
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
        <h3 className="text-sm">
          You have got some bookings that you need to leave or remove before you
          can say goodbye.
        </h3>

        {(!!bookingsJoined?.length || !!bookingsCreated?.length) &&
          leaveJoinedBookingsDialogue}
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
