import { useSession } from "next-auth/react";

import { useEffect, useMemo, useState } from "react";

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
  const [locked, setLocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>();

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

  const resetBooking = () => {
    setCourt(null);
    setDuration(undefined);
    setDate(undefined);
    setTime(undefined);
    setMaxPlayers(4);
  };

  const {
    data: bookings,
    refetch: refetchBookings,
    isInitialLoading: isInitialLoadingBookings,
  } = api.booking.getAll.useQuery();

  const { data: users } = api.user.getAll.useQuery();
  const { data: facilities } = api.facility.getAll.useQuery();

  const createBooking = api.booking.create.useMutation({});
  const updateBooking = api.booking.update.useMutation({});
  const updateLock = api.booking.updateLock.useMutation({});
  const emailerMutation = api.emailer.sendEmail.useMutation();

  const mutateBookingLock = () => {
    console.log("HEJ");

    if (bookingToEdit) {
      setIsLoading(true);
      updateLock.mutate(
        { id: bookingToEdit.id, locked: !locked },
        {
          onSuccess: (mutatedBooking: Booking) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setLocked(mutatedBooking?.locked);
          },
          onSettled: () => {
            setIsLoading(false);
            void refetchBookings();
          },
        }
      );
    } else {
      setLocked(!locked);
    }
  };

  useEffect(() => {
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
        setLocked(booking.locked);
        setCourt(booking?.court);
        setDuration(booking?.duration);
        setMaxPlayers(booking.maxPlayers || 0);
      }
    } else {
      setEventType("ADD");
      setFacility(facilities?.find((facility) => facility.id === "1"));
      setLocked(false);
      resetBooking();
    }
  }, [bookingToEdit, bookings, facilities, router.query.booking]);

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

    if (!!bookingToEdit) {
      const recipients = getEmailRecipients({
        users: users || [],
        booking: bookingToEdit,
        sessionUserId: sessionData?.user.id,
        eventType: "MODIFY",
      });

      const preserveDuration =
        duration !== undefined &&
        facility.durations.find((dur) => dur === duration?.toString()) !==
          undefined;

      updateBooking.mutate(
        {
          id: bookingToEdit.id,
          date: new Date(formattedDate.replace(" ", "T")),
          court: court || null,
          players: bookingToEdit.players,
          duration: preserveDuration ? duration : 0,
          facility: facility.id || null,
          association: association || null,
          maxPlayers: maxPlayers || 0,
        },
        {
          onSuccess: (mutatedBooking: Booking) => {
            emailDispatcher({
              originalBooking: bookingToEdit,
              mutatedBooking,
              bookerName: sessionData.user.name || "Someone",
              bookings: bookings || [],
              eventType,
              recipients,
              mutation: emailerMutation,
            });
            void refetchBookings().then(() => {
              void router.push("/");
            });
          },
        }
      );
    } else {
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
          locked: locked,
        },
        sessionUserId: sessionData.user.id,
        eventType: "ADD",
      });

      createBooking.mutate(
        {
          userId: sessionData?.user.id,
          date: new Date(formattedDate.replace(" ", "T")),
          court: court || null,
          facilityId: facility.id || null,
          associationId: association || null,
          duration: duration || null,
          maxPlayers: maxPlayers === undefined ? 0 : maxPlayers,
          locked: locked,
        },
        {
          onSuccess: () => {
            if (eventType === "ADD" && locked) {
              console.log(
                "No email sent due to booking being set to locked when added"
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
                  locked: locked,
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
          },
        }
      );
    }
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
                {eventType === "ADD" && (
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
                <div className="flex flex-col align-middle">
                  <label className="label">
                    <span className="label-text text-lg text-white">
                      Prevent join
                    </span>
                  </label>
                  <div className="flex flex-col self-start">
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          className={`toggle-error toggle toggle-lg`}
                          onChange={mutateBookingLock}
                          checked={locked}
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
                  <span>Facility</span>
                  <select
                    className="select-bordered select"
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
                  <span className="label-text text-white">
                    How many players are required/allowed?
                  </span>
                </label>
                <label className="input-group">
                  <span>Players</span>
                  <select
                    className="select-bordered select"
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
                {/* <label className="label">
                  <span className="label-text text-white">
                    With what group?
                  </span>
                </label>
                <label className="input-group">
                  <span>Group</span>
                  <select
                    className="select-bordered select"
                    onChange={(val) => {
                      const selected =
                        val.target.options[val.target.selectedIndex];
                      const associationId = selected?.dataset["associationId"];
                      setAssociation(associationId);
                    }}
                    value={
                      userAssociations?.find((a) => a.id === association)
                        ?.name || "Open (everyone)"
                    }
                  >
                    <option>Open (everyone)</option>
                    {userAssociations?.map((association) => {
                      return (
                        <option
                          key={association.id}
                          data-association-id={association.id}
                        >
                          {association.name}
                        </option>
                      );
                    })}
                  </select>
                </label> */}
                {!!facility?.durations?.length && (
                  <>
                    <label className="label">
                      <span className="label-text text-white">
                        For how long?
                      </span>
                    </label>
                    <label className="input-group">
                      <span>Duration</span>
                      <select
                        className="select-bordered select"
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
                      <span>Court</span>
                      <select
                        className="select-bordered select"
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
                <label className="label">
                  <span className="label-text text-white">Players</span>
                </label>
                <PlayersTable booking={bookingToEdit || defaultBooking} />
                <div className="btn-group btn-group-vertical flex self-end pt-5">
                  <Link className="btn-warning btn text-white" href="/">
                    Back
                  </Link>
                  <button
                    onClick={addBooking}
                    className={`${
                      validBooking ? "btn-accent" : "btn-disabled"
                    } btn text-white`}
                  >
                    Save
                  </button>
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
