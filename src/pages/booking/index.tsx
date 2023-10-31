import { useSession } from "next-auth/react";

import { useEffect, useState } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Booking, type Facility } from "@prisma/client";
import Link from "next/link";
import { PlayersTable } from "~/components/PlayersTable";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { SubHeader } from "~/components/SubHeader";
import { type EventType, emailDispatcher } from "~/utils/booking.util";
import { getEmailRecipients } from "~/utils/general.util";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
import ActionModal from "~/components/ActionModal";

const Booking = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const { isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();
  const router = useRouter();
  const [bookingToEdit, setBookingToEdit] = useState<Booking>();
  const [court, setCourt] = useState<string | null>();
  const [association, setAssociation] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [facility, setFacility] = useState<Facility | null>();
  const [eventType, setEventType] = useState<EventType>("ADD");
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const [joinable, setJoinable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>();

  type PrePopulateBookingState = {
    bookingToEdit: Booking;
    court?: string;
    duration?: number;
    date: Date;
    time: string;
    facility: Facility;
    eventType: EventType;
    maxPlayers?: number;
    joinable: boolean;
  };

  const setPrePopulateBookingState = () => {
    localStorage.setItem(
      "booking-state",
      JSON.stringify({
        bookingToEdit,
        court,
        association,
        duration,
        time,
        date,
        facility,
        eventType,
        maxPlayers,
        joinable,
        isLoading,
      })
    );
  };

  const readPrePopulateBookingState = ():
    | PrePopulateBookingState
    | undefined => {
    try {
      const output = localStorage.getItem("booking-state") || "";
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(output);
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

  const {
    data: bookings,
    refetch: refetchBookings,
    isInitialLoading: isInitialLoadingBookings,
  } = api.booking.getAll.useQuery();

  const query = Array.isArray(router.query.booking)
    ? router?.query?.booking[0] || ""
    : router?.query?.booking || "";

  const { data: users } = api.user.getAll.useQuery();
  const { data: facilities } = api.facility.getAll.useQuery();

  const { data: bte, isFetched: isSingleBookingFetched } =
    api.booking.getSingle.useQuery({
      id: query,
    });

  const { mutate: mutateBooking, isLoading: isLoadingBookingMutation } =
    api.booking.create.useMutation({});
  const updateJoinable = api.booking.updateJoinable.useMutation({});
  const emailerMutation = api.emailer.sendEmail.useMutation();

  const mutateJoinable = () => {
    if (bookingToEdit) {
      setIsLoading(true);
      updateJoinable.mutate(
        { id: bookingToEdit.id, joinable: !joinable },
        {
          onSuccess: (mutatedBooking: Booking) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setJoinable(mutatedBooking?.joinable);
          },
          onSettled: () => {
            setIsLoading(false);
            void refetchBookings();
          },
        }
      );
    } else {
      console.log("Set joinable:", joinable);

      setJoinable(!joinable);
    }
  };

  const getPrePopulationSource = (
    bookingToEdit: Booking | null | undefined,
    facilities: Facility[]
  ) => {
    if (router.query.booking && bookingToEdit) {
      return {
        court: bookingToEdit?.court,
        duration: bookingToEdit?.duration,
        maxPlayers: bookingToEdit?.maxPlayers,
        date: bookingToEdit?.date,
        joinable: Boolean(bookingToEdit?.joinable),
        time: bookingToEdit?.date.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        facility: facilities.find(({ id }) => id === bookingToEdit?.facilityId),
      } as PrePopulateBookingState;
    } else {
      const ls = readPrePopulateBookingState();
      if (ls) {
        return {
          court: ls?.court,
          duration: Number(ls?.duration),
          maxPlayers: ls?.maxPlayers,
          date: ls?.date,
          time: ls?.time,
          facility: facilities[0],
          joinable: ls.joinable,
        } as PrePopulateBookingState;
      }
    }
  };

  useEffect(() => {
    if (!router.isReady) {
      return undefined;
    }

    if (router.query.booking && !isSingleBookingFetched) {
      return undefined;
    }

    console.log("Ready", router.isReady);
    console.log("bte", bte);

    const source = getPrePopulationSource(bte, facilities || []);

    if (source) {
      setJoinable(source.joinable);

      if (source.facility) {
        setFacility(source.facility);
      }

      if (Number.isInteger(source.duration)) {
        setDuration(source.duration);
      }
      if (source.maxPlayers) {
        setMaxPlayers(source.maxPlayers);
      }
      if (source.court) {
        setCourt(source.court);
      }

      if (source.date !== null && source.date !== undefined) {
        setDate(new Date(source.date));
      }

      if (source.time !== null && source.time !== undefined) {
        setTime(source.time);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  /*   useEffect(() => {
    if (!router.isReady) {
      return undefined;
    }

    if (router.query.booking && !isSingleBookingFetched) {
      return undefined;
    }

    console.log("Ready", router.isReady);
    console.log("bte", bte);

    const source = getPrePopulationSource(bte, facilities || []);

    if (source) {
      setJoinable(source.joinable);

      if (source.facility) {
        setFacility(source.facility);
      }

      if (Number.isInteger(source.duration)) {
        setDuration(source.duration);
      }
      if (source.maxPlayers) {
        setMaxPlayers(source.maxPlayers);
      }
      if (source.court) {
        setCourt(source.court);
      }

      if (source.date !== null && source.date !== undefined) {
        setDate(new Date(source.date));
      }

      if (source.time !== null && source.time !== undefined) {
        setTime(source.time);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.booking, bte, router.isReady, isSingleBookingFetched]); */

  useEffect(() => {
    if (router.isReady && !router.query.booking) {
      console.log("SETTING LOCAL STORAGE");

      setPrePopulateBookingState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    facility,
    joinable,
    court,
    duration,
    date,
    time,
    maxPlayers,
    bookingToEdit,
    bookings,
  ]);

  /*   useEffect(() => {
    console.log(bookingToEdit, bookings, facilities, router.query.booking);

    if (router.query.booking) {
      const booking = bookings?.find(
        ({ id }) => router.query.booking === id
      ) as Booking;

      if (!!booking && !bookingToEdit) {
        const facility = facilities?.find(
          (item) => item.id === booking.facilityId
        );

        setBookingToEdit(booking);
        setEventType("MODIFY");
        setDate(booking?.date);
        setAssociation(booking.associationId);
        setFacility(facility || null);
        setTime(
          booking?.date.toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setJoinable(booking.joinable);
        setCourt(booking?.court);
        setDuration(booking?.duration);
        setMaxPlayers(booking.maxPlayers || 0);
      }
    } else {
      console.log("Will reset");

      setEventType("ADD");
      setFacility(facilities?.find((facility) => facility.id === "1"));
      setJoinable(false);
      resetBooking();
    }
  }, [bookingToEdit, bookings, facilities, router.query.booking]); */

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
      users: users || [],
      booking: {
        id: "placeholderId",
        associationId: association || null,
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
        associationId: association || null,
        duration: duration || null,
        maxPlayers: maxPlayers === undefined ? 0 : maxPlayers,
        joinable: joinable,
      },
      {
        onSuccess: () => {
          if (eventType === "ADD" && joinable) {
            console.log(
              "No email sent due to booking being set to joinable when added"
            );
          } else {
            emailDispatcher({
              originalBooking: {
                id: "placeholderId",
                associationId: association || null,
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

  return (
    <>
      <SubHeader
        title={router.query.booking ? "Change booking" : "Add booking"}
      />
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
                  title={`Confirm ${
                    router.query.booking ? "new booking details" : "new booking"
                  }`}
                  confirmButtonText={"Update"}
                  cancelButtonText="Cancel"
                  level="success"
                >
                  {router.query.booking ? (
                    <p className="py-4">
                      All players in this booking will receive an email about
                      the updated booking details.
                    </p>
                  ) : (
                    <div className="py-4">
                      <p>
                        All players with notifications enabled will receive an
                        email about the new booking.
                      </p>
                      <br />
                      <p>
                        By default, the booking is open for people to join. If
                        you want to prevent others from joining right now, use
                        the toggle below. You can change this setting later
                        anytime.
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
                  )}
                </ActionModal>
                {!router.query.booking && (
                  <div className="alert alert-info mt-14 flex flex-row text-white">
                    <div>
                      <Image
                        className="mr-2 rounded-full shadow-sm shadow-black"
                        alt="arrogant-frog"
                        src="/cig-frog.gif"
                        width={55}
                        height={55}
                      />
                      <p>
                        <b>Yo!</b> Before publishing a booking here, make sure
                        that you actually book it first at{" "}
                        <a
                          style={{ color: "gold" }}
                          target="_blank"
                          className="link"
                          href="https://gbc.goactivebooking.com/book-service/27?facility=1"
                        >
                          GBC official page
                        </a>{" "}
                        and receive a confirmation email.
                      </p>
                    </div>
                  </div>
                )}

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
                  <Link
                    className="btn-warning btn text-white"
                    href="/"
                    onClick={() => {
                      localStorage.getItem("booking-state") &&
                        localStorage.removeItem("booking-state");
                    }}
                  >
                    Cancel
                  </Link>

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
