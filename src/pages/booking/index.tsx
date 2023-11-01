import { useSession } from "next-auth/react";

import { useEffect, useState } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Booking, type Facility } from "@prisma/client";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { SubHeader } from "~/components/SubHeader";
import { type EventType, emailDispatcher } from "~/utils/booking.util";
import { getEmailRecipients } from "~/utils/general.util";
import { BeatLoader } from "react-spinners";
import ActionModal from "~/components/ActionModal";
import { serverSideHelpers } from "~/utils/staticPropsUtil";

export async function getStaticProps() {
  await serverSideHelpers.facility.getAll.prefetch();

  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const Booking = () => {
  // Fix for server/client render match
  const [hydrated, setHydrated] = useState<boolean>(false);

  const { data: sessionData, status: sessionStatus } = useSession();
  const { isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();
  const router = useRouter();
  const [court, setCourt] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [facility, setFacility] = useState<Facility | null>();
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [joinable, setJoinable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>();
  const [preventLocalStorageWrite, setPreventLocalStorageWrite] =
    useState<boolean>(false);

  type PrePopulateBookingState = {
    court?: string;
    duration?: number;
    date: Date;
    time: string;
    facility: Facility;
    eventType: EventType;
    maxPlayers?: number;
    joinable: boolean;
  };

  type LocalStorageBookingState = {
    value: PrePopulateBookingState;
    expiry: number;
  };

  const setPrePopulateBookingState = () => {
    console.log("SETTING NEW");
    const now = new Date();
    // Five minutes
    const ttl = 60000;
    const data = {
      value: {
        court,
        duration,
        time,
        date,
        facility,
        maxPlayers,
        joinable,
        isLoading,
      },
      expiry: now.getTime() + ttl,
    };

    localStorage.setItem("booking-state", JSON.stringify(data));
  };

  const readPrePopulateBookingState = ():
    | PrePopulateBookingState
    | undefined => {
    try {
      const outputString = localStorage.getItem("booking-state") || "";

      if (!outputString) {
        return undefined;
      }

      const item = JSON.parse(outputString) as LocalStorageBookingState;
      const now = new Date();

      if (now.getTime() > item.expiry) {
        localStorage.removeItem("booking-state");
        return undefined;
      }

      return item.value;
    } catch (error) {
      console.error("Could not parse booking-state", error);
      return undefined;
    }
  };

  const setHours = (date: Date, hours: number) => {
    const updated = new Date(date);
    updated.setHours(hours);
    return updated;
  };

  const setMinutes = (minutes: number) => {
    const now = new Date();
    const updated = now.setMinutes(minutes);
    return new Date(updated);
  };

  const resetState = () => {
    setDuration(null);
    setDuration(null);
  };

  const {
    data: bookings,
    refetch: refetchBookings,
    isInitialLoading: isInitialLoadingBookings,
  } = api.booking.getAll.useQuery();

  const { data: facilities } = api.facility.getAll.useQuery();

  const { mutate: mutateBooking, isLoading: isLoadingBookingMutation } =
    api.booking.create.useMutation({});
  const emailerMutation = api.emailer.sendEmail.useMutation();

  const mutateJoinable = () => {
    setJoinable(!joinable);
  };

  const getPrePopulationState = (facilities: Facility[]) => {
    const ls = readPrePopulateBookingState();
    if (ls) {
      return {
        court: ls?.court,
        duration: Number(ls?.duration),
        maxPlayers: ls?.maxPlayers,
        date: ls?.date,
        time: ls?.time,
        facility: facilities.find((facility) => facility.id === "1"),
        joinable: ls.joinable,
      } as PrePopulateBookingState;
    }
  };

  const localStorageState = getPrePopulationState(facilities || []);
  useEffect(() => {
    console.log("HEJ HEJ HEJ");
    setHydrated(true);

    console.log({ facilities, facility, hydrated });

    if (!hydrated) {
      console.log("NON HYDR");
      return undefined;
    }

    if (!localStorageState) {
      setFacility(facilities?.find((facility) => facility?.id === "1"));
    }

    if (localStorageState) {
      setJoinable(localStorageState.joinable);

      console.log({ localStorageStateFacil: localStorageState.facility });
      if (localStorageState.facility) {
        setFacility(localStorageState.facility);
      }

      if (Number.isInteger(localStorageState.duration)) {
        setDuration(localStorageState.duration);
      }
      if (localStorageState.maxPlayers) {
        setMaxPlayers(localStorageState.maxPlayers);
      }
      if (localStorageState.court) {
        setCourt(localStorageState.court);
      }

      if (
        localStorageState.date !== null &&
        localStorageState.date !== undefined
      ) {
        setDate(new Date(localStorageState.date));
      }

      if (
        localStorageState.time !== null &&
        localStorageState.time !== undefined
      ) {
        setTime(localStorageState.time);
      }
    }
  }, [facilities, facility, hydrated]);

  useEffect(() => {
    console.log("");
    if (hydrated && !isInitialLoading && !preventLocalStorageWrite) {
      setPrePopulateBookingState();
    }
  }, [
    court,
    duration,
    time,
    date,
    facility,
    maxPlayers,
    joinable,
    isLoading,
    preventLocalStorageWrite,
  ]);

  const isInitialLoading =
    isInitialLoadingBookings ||
    isInitialLoadingUsers ||
    sessionStatus === "loading";

  const defaultBooking = {
    players: [sessionData?.user.id],
    court: null,
    userId: sessionData?.user.id,
  } as Booking;

  const today = new Date(new Date().setDate(new Date().getDate() - 1));

  const bookingDateFutureLimit = new Date(
    new Date().setDate(new Date().getDate() + 14)
  );

  const getBookableHours = () => {
    const timeSlots = [];

    for (let i = 9; i <= 21; i++) {
      timeSlots.push(setHours(setMinutes(0), i));
      if (i < 21) {
        timeSlots.push(setHours(setMinutes(30), i));
      }
    }
    return timeSlots;
  };

  const filterPassedTime = (time: Date) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    return currentDate.getTime() < selectedDate.getTime();
  };

  const addBooking = () => {
    if (!validBooking) {
      return null;
    }

    const formattedDate = date?.toLocaleString("sv-SE");

    const recipients = getEmailRecipients({
      users: [],
      booking: {
        id: "placeholderId",
        associationId: null,
        facilityId: null,
        private: true,
        userId: sessionData?.user.id,
        date: new Date(formattedDate.replace(" ", "T")),
        court: court || null,
        duration: duration || 0,
        players: [],
        maxPlayers: maxPlayers || null,
        joinable: joinable,
      },
      sessionUserId: sessionData.user.id,
      eventType: "ADD",
    });

    mutateBooking(
      {
        userId: sessionData?.user.id,
        date: new Date(formattedDate.replace(" ", "T")),
        court: court || null,
        facilityId: facility.id || null,
        associationId: null,
        duration: duration || null,
        maxPlayers: maxPlayers === undefined ? 0 : maxPlayers,
        joinable: joinable,
      },
      {
        onSuccess: () => {
          if (!joinable) {
            console.log(
              "No email sent due to booking being set to joinable when added"
            );
          } else {
            emailDispatcher({
              originalBooking: {
                id: "placeholderId",
                associationId: null,
                facilityId: null,
                private: true,
                userId: sessionData?.user.id,
                date: new Date(formattedDate?.replace(" ", "T")),
                court: court || null,
                duration: duration || 0,
                players: [],
                maxPlayers: maxPlayers || null,
                joinable: joinable,
              },
              recipients,
              bookerName: sessionData.user.name || "Someone",
              bookings: bookings || [],
              eventType: "ADD",
              mutation: emailerMutation,
            });
          }
          void refetchBookings().then(() => {
            void router.push("/");
          });
          localStorage.removeItem("booking-state");
        },
      }
    );
  };

  const validBooking =
    !!sessionData?.user.id &&
    !!date &&
    !!time &&
    !!facility &&
    (facility?.courts.length ? !!court : true) &&
    (facility?.durations.length ? !!duration : true);

  if (!hydrated || isInitialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <BeatLoader size={20} color="white" />
      </div>
    );
  }

  return (
    <>
      <SubHeader title={"Publish booking"} />
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {!isInitialLoading && sessionStatus === "unauthenticated" ? (
          <div className="flex h-screen flex-col items-center justify-center p-3">
            <h2 className="text-center text-2xl text-white">
              If you want to add or edit bookings, you have to be logged in.
            </h2>
          </div>
        ) : (
          <div className="container max-w-md p-4">
            {sessionData?.user.id && (
              <div>
                <ActionModal
                  callback={addBooking}
                  data={undefined}
                  tagRef={`booking`}
                  title="Confirm new booking"
                  confirmButtonText={"Publish"}
                  cancelButtonText="Cancel"
                  level="success"
                >
                  <div className="py-4">
                    <p>
                      All players with notifications enabled will receive an
                      email about the new booking.
                    </p>
                    <br />
                    <p>
                      By default, the booking is open for people to join. If you
                      want to prevent others from joining right now, use the
                      toggle below. You can change this setting later anytime.
                    </p>
                    <div className="flex flex-col self-start">
                      <div>
                        <label className="label mt-2">
                          <span className="label-text">
                            Allow players to join
                          </span>
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            className={`toggle-accent toggle toggle-md`}
                            onChange={mutateJoinable}
                            checked={joinable}
                          />
                        </label>
                      </div>
                      {isLoading ? (
                        <div className="self-center">
                          <BeatLoader size={10} color="purple" />
                        </div>
                      ) : (
                        <div style={{ height: "24px" }}></div>
                      )}
                    </div>
                  </div>
                </ActionModal>

                <label className="label">
                  <span className="label-text text-white">
                    When are you playing?
                  </span>
                </label>
                <div className="custom-datepicker-wrapper pb-6">
                  <DatePicker
                    popperPlacement="top"
                    id="booking-date-picker"
                    className="p-3"
                    showTimeSelect
                    selected={date}
                    open={true}
                    fixedHeight={true}
                    placeholderText="Pick date and time"
                    timeFormat="HH:mm"
                    dateFormat="yyyy-MM-dd - HH:mm"
                    filterTime={filterPassedTime}
                    includeTimes={getBookableHours()}
                    includeDateIntervals={[
                      {
                        start: today,
                        end: bookingDateFutureLimit,
                      },
                    ]}
                    onChange={(date: Date) => {
                      setDate(date);

                      if (date.getHours() < 9 || date.getHours() > 21) {
                        date.setHours(9);
                      }

                      setTime(
                        date.toLocaleTimeString("sv-SE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      );
                    }}
                  />
                </div>
                <label className="label">
                  <span className="label-text text-white">Where to play?</span>
                </label>
                <label className="input-group">
                  <span className="label-info-text">Facility</span>
                  <select
                    className="full-width select-bordered select"
                    onChange={(val) => {
                      const selected =
                        val.target.options[val.target.selectedIndex];

                      const facilityId = selected?.dataset["facilityId"];
                      const facilityToSelect = facilities?.find(
                        (f) => f.id === facilityId
                      );
                      setFacility(facilityToSelect);
                      setCourt(null);
                      setDuration(null);
                    }}
                    value={facility?.name || "Pick a place"}
                  >
                    <option disabled>Pick a place</option>
                    {facilities
                      ?.filter((facility) => facility.id === "1")
                      .map((facility) => {
                        return (
                          <option
                            key={facility.id}
                            data-facility-id={facility.id}
                          >
                            {facility.name}
                          </option>
                        );
                      })}
                  </select>
                </label>
                <label className="label">
                  <span className="label-text label-text text-white">
                    How many players are required/allowed?
                  </span>
                </label>
                <label className="input-group">
                  <span className="label-info-text">Players</span>
                  <select
                    className="full-width select-bordered select"
                    onChange={(val) => {
                      const selected =
                        val.target.options[val.target.selectedIndex]?.value;

                      if (typeof selected === "string") {
                        setMaxPlayers(parseInt(selected));
                      } else {
                        setMaxPlayers(0);
                      }
                    }}
                    value={maxPlayers === 0 ? "Unlimited" : maxPlayers}
                  >
                    <option disabled>Players</option>
                    <option value={0}>Unlimited</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                    <option>8</option>
                    <option>9</option>
                    <option>10</option>
                    <option>11</option>
                    <option>12</option>
                  </select>
                </label>

                {!!facility?.durations?.length && (
                  <>
                    <label className="label">
                      <span className="label-text text-white">
                        For how long?
                      </span>
                    </label>
                    <label className="input-group">
                      <span className="label-info-text">Duration</span>
                      <select
                        className="full-width select-bordered select"
                        onChange={(val) => {
                          setDuration(parseInt(val.target.value));
                        }}
                        value={duration || "Select duration"}
                      >
                        <option disabled>Select duration</option>
                        {facility.durations.map((item) => {
                          return (
                            <option key={item} value={item}>
                              {item} minutes
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </>
                )}
                {!!facility?.courts.length && (
                  <>
                    <label className="label">
                      <span className="label-text text-white">What court?</span>
                    </label>
                    <label className="input-group">
                      <span className="label-info-text">Court</span>
                      <select
                        className="full-width select-bordered select"
                        onChange={(val) => {
                          setCourt(val.target.value);
                        }}
                        value={court || "Pick court"}
                      >
                        <option disabled>Pick court</option>
                        {facility.courts.map((court) => {
                          return (
                            <option
                              key={court}
                              data-court-id={court}
                              value={court}
                            >
                              {court}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  </>
                )}
                <div className="flex flex-col align-middle">
                  <label className="label">
                    <span className="text-md label-text text-white">
                      Allow players to join
                    </span>
                  </label>
                  <div className="flex flex-col self-start">
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          className={`toggle-accent toggle toggle-md`}
                          onChange={mutateJoinable}
                          checked={joinable}
                        />
                      </label>
                    </div>
                    {isLoading ? (
                      <div className="self-center">
                        <BeatLoader size={10} color="purple" />
                      </div>
                    ) : (
                      <div style={{ height: "24px" }}></div>
                    )}
                  </div>
                </div>
                <div className="w-100 btn-group btn-group-horizontal flex justify-center self-center pt-5">
                  <button
                    className="btn-warning btn text-white"
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onClick={async () => {
                      setPreventLocalStorageWrite(true);
                      localStorage.getItem("booking-state") &&
                        localStorage.removeItem("booking-state");
                      await router.push("/");
                    }}
                  >
                    Cancel
                  </button>

                  <label
                    style={{ position: "relative" }}
                    className={`${
                      validBooking && !isInitialLoadingBookings
                        ? "btn-success"
                        : "btn-disabled"
                    } btn text-white`}
                    htmlFor="action-modal-booking"
                  >
                    Publish
                    {isLoadingBookingMutation && (
                      <div style={{ position: "absolute", bottom: 0 }}>
                        <BeatLoader size={8} color="white" />
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default Booking;
