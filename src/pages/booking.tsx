import { type NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import { Header } from "~/components/Header";
import { useEffect, useState } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Booking } from "@prisma/client";
import Link from "next/link";
import { PlayersTable } from "~/components/PlayersTable";

const Booking: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const { isInitialLoading: isInitialLoadingUsers } =
    api.user.getAll.useQuery();
  const router = useRouter();
  const [bookingToEdit, setBookingToEdit] = useState<Booking>();
  const [court, setCourt] = useState<number | null>();
  const [duration, setDuration] = useState<number>();
  const [date, setDate] = useState<string>();
  const [time, setTime] = useState<string>();

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

  useEffect(() => {
    if (router.query.booking) {
      const booking = bookings?.find(
        ({ id }) => router.query.booking === id
      ) as Booking;

      if (!!booking && !bookingToEdit) {
        setBookingToEdit(booking);

        setDate(booking?.date?.toLocaleDateString("sv-SE"));
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

  const addBooking = () => {
    if (!validBooking) {
      return null;
    }

    if (!!bookingToEdit) {
      const newDate = new Date(`${date}T${time}`);
      console.log({ court });
      console.log({ bookingToEdit });

      updateBooking.mutate({
        id: bookingToEdit.id,
        date: newDate,
        court,
        players: bookingToEdit.players,
        duration,
      });
    } else {
      createBooking.mutate({
        userId: sessionData?.user.id,
        date: new Date(`${date}T${time}`),
        court,
      });
    }
    void refetchBookings().then(() => {
      void router.push("/");
    });
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
      <Header noBoxShadow />
      <div className="sticky top-16 z-30 bg-slate-800 p-2 text-center text-lg text-slate-400 shadow-md shadow-stone-900">
        {router.query.booking ? "Change booking" : "Add booking"}
      </div>
      <main className="min-w-sm pd-3 flex min-w-fit flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {!isInitialLoading && sessionStatus === "unauthenticated" ? (
          <div className="flex h-screen flex-col items-center justify-center p-3">
            <h2 className="text-center text-2xl text-white">
              If you want to add or edit bookings, you have to be logged in.
            </h2>
          </div>
        ) : (
          <div className="container p-4">
            {sessionData?.user.id && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">When</span>
                </label>
                <label className="input-group">
                  <span>Date</span>
                  <input
                    onChange={({ target }) => {
                      setDate(target.value);
                    }}
                    defaultValue={date}
                    type="date"
                    className="input-bordered input"
                  />
                  <input
                    defaultValue={time}
                    onChange={({ target }) => {
                      setTime(target.value);
                    }}
                    type="time"
                    className="input-bordered input"
                  />
                </label>

                <br />
                <label className="label">
                  <span className="label-text text-white">Duration</span>
                </label>
                <div className="btn-group">
                  <button
                    onClick={(e) => {
                      const target = e.target as HTMLTextAreaElement;

                      setDuration(parseInt(target.value));
                    }}
                    className={`btn ${duration === 60 ? "btn-active" : ""}`}
                    value={60}
                  >
                    60 min
                  </button>
                  <button
                    onClick={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      setDuration(parseInt(target.value));
                    }}
                    className={`btn ${duration === 90 ? "btn-active" : ""}`}
                    value={90}
                  >
                    90 min
                  </button>
                </div>
                <br />
                <label className="label">
                  <span className="label-text text-white">Where</span>
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
                    <option>11</option>
                    <option>12</option>
                  </select>
                </label>
                <br />
                <label className="label">
                  <span className="label-text text-white">Players</span>
                </label>
                <PlayersTable booking={bookingToEdit || defaultBooking} />
                <div className="btn-group btn-group-vertical pt-5">
                  <Link className="btn-warning btn text-white" href="/">
                    Back
                  </Link>
                  <button
                    onClick={addBooking}
                    className={`${
                      validBooking ? "btn-success" : "btn-disabled"
                    } btn text-white`}
                  >
                    SAVE
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
