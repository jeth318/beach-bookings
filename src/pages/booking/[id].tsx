import { useSession } from "next-auth/react";

import { type ChangeEvent, useState, useEffect } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Booking, type Facility } from "@prisma/client";
import Link from "next/link";
import { PlayersTable } from "~/components/PlayersTable";

import { SubHeader } from "~/components/SubHeader";
import {
  type EventType,
  emailDispatcher,
  maxPlayersToShow,
} from "~/utils/booking.util";
import { getEmailRecipients, renderToast } from "~/utils/general.util";
import { BeatLoader } from "react-spinners";
import ActionModal from "~/components/ActionModal";
import { JoinableToggle } from "~/components/JoinableToggle";
import { SelectInput } from "~/components/SelectInput";
import { DateSelector } from "~/components/DateSelector";
import { Toast } from "~/components/Toast";

const Booking = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const router = useRouter();
  const [court, setCourt] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [facility, setFacility] = useState<Facility | null>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const [joinable, setJoinable] = useState<boolean>();
  const [eventType, setEventType] = useState<EventType>();
  const [toastMessage, setToastMessage] = useState<string>();

  const query = Array.isArray(router.query.id)
    ? router?.query?.id[0] || ""
    : router?.query?.id || "";

  const { data: facilities, isFetched: areFacilitiesFetched } =
    api.facility.getAll.useQuery();

  const { data: booking } = api.booking.getSingle.useQuery({
    id: query,
  });

  const { data: users, isFetched: areUsersFetched } =
    api.user.getMultipleByIds.useQuery({
      playerIds: booking?.players || [],
    });

  const { mutate: mutateBooking, isLoading: isLoadingBookingMutation } =
    api.booking.update.useMutation({});

  const { mutate: mutateJoinable, isLoading: isLoadingJoinable } =
    api.booking.updateJoinable.useMutation({});
  const emailerMutation = api.emailer.sendEmail.useMutation();

  const onJoinableChange = () => {
    if (booking) {
      mutateJoinable(
        { id: booking.id, joinable: !joinable },
        {
          onSuccess: (mutatedBooking: Booking) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setJoinable(mutatedBooking?.joinable);
            renderToast(
              `Your booking is ${
                !joinable ? "now joinable." : "no longer joinble."
              }`,
              setToastMessage
            );
          },
          onSettled: () => {
            //void refetchBookings();
          },
        }
      );
    } else {
      setJoinable(!joinable);
    }
  };

  const facilitiesToShow =
    facilities
      ?.filter((facility) => facility.id === "1")
      .map((facility) => ({
        id: facility.id,
        name: facility.name,
      })) || [];

  const isInitialLoading = sessionStatus === "loading";

  const defaultBooking = {
    players: [sessionData?.user.id],
    court: null,
    maxPlayers: 4,
    userId: sessionData?.user.id,
  } as Booking;

  const onDateSelect = (date: Date) => {
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
  };

  const onFacilitySelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.options[event.target.selectedIndex];

    const facilityId = selected?.dataset["facilityId"];
    const facilityToSelect = facilities?.find((f) => f.id === facilityId);
    setFacility(facilityToSelect);
    setCourt(null);
    setDuration(null);
  };

  const onDurationSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setDuration(Number(event?.target?.value));
  };

  const onMaxPlayersSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setMaxPlayers(parseInt(event?.target.value));
  };

  const onCourtSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setCourt(event?.target.value);
  };

  const updateBooking = () => {
    if (!validBooking) {
      return null;
    }

    const formattedDate = date?.toLocaleString("sv-SE");

    if (!!booking) {
      const recipients = getEmailRecipients({
        users: users || [],
        playersInBooking: booking.players,
        sessionUserId: sessionData?.user.id,
        eventType: "MODIFY",
      });

      const preserveDuration =
        duration !== undefined &&
        facility.durations.find((dur) => dur === duration?.toString()) !==
          undefined;

      mutateBooking(
        {
          id: booking.id,
          date: new Date(formattedDate.replace(" ", "T")),
          court: court || null,
          players: booking.players,
          duration: preserveDuration ? duration : 0,
          facility: facility.id || null,
          association: null,
          maxPlayers: maxPlayers || 0,
          joinable: joinable || false,
        },
        {
          onSuccess: (mutatedBooking: Booking) => {
            emailDispatcher({
              originalBooking: booking,
              mutatedBooking,
              bookerName: sessionData.user.name || "Someone",
              bookings: [],
              eventType: "MODIFY",
              recipients,
              mutation: emailerMutation,
            });
            renderToast("Your booking details were updated", setToastMessage);
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

  console.log({ validBooking });

  useEffect(() => {
    if (!areUsersFetched || !areFacilitiesFetched) {
      return undefined;
    }

    if (booking?.joinable) {
      setJoinable(booking.joinable);
    }

    if (!facility && !!facilities?.length) {
      setFacility(facilities.find((facility) => facility.id === "1"));
    }

    if (facility) {
      if (!duration) {
        setDuration(booking?.duration);
      }

      if (!court) {
        setCourt(booking?.court);
      }
    }

    if (!maxPlayers) {
      setMaxPlayers(booking?.maxPlayers || 4);
    }

    if (!date) {
      setDate(booking?.date);
    }
    if (date && !time) {
      setTime(
        date?.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [
    areFacilitiesFetched,
    areUsersFetched,
    booking?.court,
    booking?.date,
    booking?.duration,
    booking?.maxPlayers,
    court,
    date,
    duration,
    facilities,
    facility,
    maxPlayers,
    time,
  ]);

  return (
    <>
      {toastMessage && <Toast body={toastMessage} />}
      <SubHeader title="Change booking" />
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {!isInitialLoading && sessionStatus === "unauthenticated" ? (
          <div className="flex h-screen flex-col items-center justify-center p-3">
            <h2 className="text-center text-2xl text-white">
              If you want to add or edit bookings, you have to be logged in.
            </h2>
          </div>
        ) : (
          <div className="smooth-render-in container max-w-md p-4">
            {sessionData?.user.id &&
            booking?.id &&
            facility &&
            booking?.joinable !== undefined ? (
              <div className="mt-4">
                <JoinableToggle
                  textColor="white"
                  value={joinable || false}
                  isLoading={isLoadingJoinable}
                  callback={onJoinableChange}
                />
                <ActionModal
                  callback={updateBooking}
                  data={undefined}
                  tagRef={`booking`}
                  title={`Confirm ${
                    router.query.id ? "new booking details" : "new booking"
                  }`}
                  confirmButtonText={"Update"}
                  cancelButtonText="Cancel"
                  level="success"
                >
                  <p className="py-4">
                    All players in this booking will receive an email about the
                    updated booking details.
                  </p>
                </ActionModal>
                <SelectInput
                  label="Facility"
                  description="Where are you playing?"
                  valid={!!facility}
                  value={facility?.name || "Pick a place"}
                  items={facilitiesToShow}
                  callback={onFacilitySelect}
                />

                <SelectInput
                  label="Players"
                  description="How many players are required/allowed?"
                  valid={!!maxPlayers}
                  value={String(maxPlayers) || "Players"}
                  items={maxPlayersToShow}
                  callback={onMaxPlayersSelect}
                />

                {!!facility?.durations?.length && (
                  <SelectInput
                    label="Duration"
                    disabledOption="Select duration"
                    description="Fow how long?"
                    optionSuffix={` minutes`}
                    valid={!!duration}
                    value={duration || "Select duration"}
                    items={facility.durations.map((item) => ({
                      id: item,
                      name: item,
                    }))}
                    callback={onDurationSelect}
                  />
                )}

                {!!facility?.courts.length && (
                  <SelectInput
                    label="Court"
                    disabledOption="Pick court"
                    description="What court?"
                    valid={!!court}
                    value={court || "Pick court"}
                    items={facility.courts.map((item) => ({
                      id: item,
                      name: item,
                    }))}
                    callback={onCourtSelect}
                  />
                )}
                <DateSelector date={date} time={time} callback={onDateSelect} />

                {router.query.id && (
                  <>
                    <label className="label">
                      <span className="label-text text-white">Players</span>
                    </label>
                    <PlayersTable booking={booking || defaultBooking} />
                  </>
                )}
                <div className="mb-40 flex flex-col justify-center">
                  <div className="w-100 btn-group btn-group-horizontal flex justify-center self-center pt-5">
                    <Link
                      href="/"
                      className={`${
                        validBooking && !isLoadingBookingMutation
                          ? "btn btn-warning"
                          : "btn-disabled"
                      } btn text-white`}
                    >
                      Cancel
                    </Link>

                    <label
                      style={{ position: "relative" }}
                      className={`${
                        validBooking && !isLoadingBookingMutation
                          ? "btn-success"
                          : "btn-disabled"
                      } btn text-white`}
                      htmlFor="action-modal-booking"
                    >
                      {router.query.id ? "Update" : "Publish"}
                    </label>
                  </div>
                  {isLoadingBookingMutation && (
                    <div className="mt-4 flex justify-center">
                      <BeatLoader size={15} color="white" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-screen items-center justify-center self-center">
                <BeatLoader size={20} color="white" />
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default Booking;
