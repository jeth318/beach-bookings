import Head from "next/head";
import { useSession } from "next-auth/react";

import { useEffect, useState } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Booking } from "@prisma/client";
import Link from "next/link";
import { PlayersTable } from "~/components/PlayersTable";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { SubHeader } from "~/components/SubHeader";
import { type EventType, emailDispatcher } from "~/utils/booking.util";

const Booking = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const { isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();
  const router = useRouter();
  const [bookingToEdit, setBookingToEdit] = useState<Booking>();
  const [court, setCourt] = useState<number | null>();
  const [duration, setDuration] = useState<number>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [eventType, setEventType] = useState<EventType>("ADD");
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
  };

  const {
    data: bookings,
    refetch: refetchBookings,
    isInitialLoading: isInitialLoadingBookings,
  } = api.booking.getAll.useQuery();
  const createBooking = api.booking.create.useMutation({});
  const updateBooking = api.booking.update.useMutation({});
  const emailerMutation = api.emailer.sendEmail.useMutation();

  useEffect(() => {
    if (router.query.booking) {
      const booking = bookings?.find(
        ({ id }) => router.query.booking === id
      ) as Booking;

      if (!!booking && !bookingToEdit) {
        setBookingToEdit(booking);
        setEventType("MODIFY");
        setDate(booking?.date);
        setTime(
          booking?.date.toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        setCourt(booking?.court);
        setDuration(booking?.duration);
      }
    } else {
      setEventType("ADD");
      resetBooking();
    }
  }, [bookingToEdit, bookings, router.query.booking]);

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

  const testEmail = () => {
    if (!sessionData?.user || !bookings?.length) {
      return null;
    }

    sessionData.user;
    emailDispatcher({
      bookerName: sessionData?.user.name || "Somebody",
      bookings,
      eventType,
      mutation: emailerMutation,
    });
  };

  const addBooking = () => {
    if (!validBooking) {
      return null;
    }
    const formattedDate = date.toLocaleString("sv-SE");

    if (!!bookingToEdit) {
      console.log("UPDATING");

      updateBooking.mutate(
        {
          id: bookingToEdit.id,
          date: new Date(formattedDate.replace(" ", "T")),
          court,
          players: bookingToEdit.players,
          duration,
        },
        {
          onSuccess: () => {
            emailDispatcher({
              bookerName: sessionData.user.name || "Someone",
              bookings: bookings || [],
              eventType,
              mutation: emailerMutation,
            });
            void refetchBookings().then(() => {
              void router.push("/");
            });
          },
        }
      );
    } else {
      createBooking.mutate(
        {
          userId: sessionData?.user.id,
          date: new Date(formattedDate.replace(" ", "T")),
          court,
        },
        {
          onSuccess: () => {
            emailDispatcher({
              bookerName: sessionData.user.name || "Someone",
              bookings: bookings || [],
              eventType,
              mutation: emailerMutation,
            });
            void refetchBookings().then(() => {
              void router.push("/");
            });
          },
        }
      );
    }
  };

  const validBooking =
    sessionData?.user.id && !!court && !!duration && !!date && !!time;

  return (
    <>
      <Head>
        <title>Beach bookings</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
                <label className="label">
                  <span className="label-text text-white">
                    When are you playing?
                  </span>
                </label>
                <div className="custom-datepicker-wrapper">
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
                  <span className="label-text text-white">For how long?</span>
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
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </label>
                <label className="label">
                  <span className="label-text text-white">What court?</span>
                </label>
                <label className="input-group">
                  <span>Court</span>
                  <select
                    className="select-bordered select"
                    onChange={(val) => {
                      setCourt(parseInt(val.target.value));
                    }}
                    value={court || "Pick court"}
                  >
                    <option disabled>Pick court</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
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
