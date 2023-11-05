import { useSession } from "next-auth/react";

import { type ChangeEvent, useEffect, useState } from "react";

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
import { BeatLoader } from "react-spinners";
import ActionModal from "~/components/ActionModal";
import { JoinableToggle } from "~/components/JoinableToggle";
import { SelectInput } from "~/components/SelectInput";
import { DateSelector } from "~/components/DateSelector";

const Booking = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const router = useRouter();
  const [court, setCourt] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [facility, setFacility] = useState<Facility | null>();
  const [eventType] = useState<EventType>("JOIN");
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const [joinable, setJoinable] = useState<boolean>(true);

  type PrePopulateBookingState = {
    bte: Booking;
    court?: string;
    duration?: number;
    date: Date;
    time: string;
    facility: Facility;
    eventType: EventType;
    maxPlayers?: number;
    joinable: boolean;
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

  const query = Array.isArray(router.query.id)
    ? router?.query?.id[0] || ""
    : router?.query?.id || "";

  const { data: users } = api.user.getAll.useQuery();
  const { data: facilities, isFetched: isFacilitiesFetched } =
    api.facility.getAll.useQuery();

  const { data: bte, isFetched: isSingleBookingFetched } =
    api.booking.getSingle.useQuery({
      id: query,
    });

  const { mutate: mutateBooking, isLoading: isLoadingBookingMutation } =
    api.booking.update.useMutation({});
  const { mutate: mutateJoinable, isLoading: isLoadingJoinable } =
    api.booking.updateJoinable.useMutation({});
  const emailerMutation = api.emailer.sendEmail.useMutation();

  const onJoinableChange = () => {
    if (bte) {
      mutateJoinable(
        { id: bte.id, joinable: !joinable },
        {
          onSuccess: (mutatedBooking: Booking) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setJoinable(mutatedBooking?.joinable);
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
      .map((facility) => {
        return {
          id: facility.id,
          name: facility.name,
        };
      }) || [];

  const maxPlayersToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
    (item) => ({
      id: String(item),
      name: String(item),
    })
  );
  const getPrePopulationSource = (
    bte: Booking | null | undefined,
    facilities: Facility[]
  ) =>
    ({
      court: bte?.court,
      duration: bte?.duration,
      maxPlayers: bte?.maxPlayers,
      date: bte?.date,
      joinable: Boolean(bte?.joinable),
      time: bte?.date.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      facility: facilities.find(({ id }) => id === bte?.facilityId),
    } as PrePopulateBookingState);

  useEffect(() => {
    if (
      !router.query.id ||
      !isSingleBookingFetched ||
      !bte ||
      !isFacilitiesFetched
    ) {
      return undefined;
    }

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
  }, [router.isReady, router.query.id, bte, isFacilitiesFetched]);

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

  const addBooking = () => {
    if (!validBooking) {
      return null;
    }

    const formattedDate = date?.toLocaleString("sv-SE");

    if (!!bte) {
      const recipients = getEmailRecipients({
        users: users || [],
        booking: bte,
        sessionUserId: sessionData?.user.id,
        eventType: "MODIFY",
      });

      const preserveDuration =
        duration !== undefined &&
        facility.durations.find((dur) => dur === duration?.toString()) !==
          undefined;

      mutateBooking(
        {
          id: bte.id,
          date: new Date(formattedDate.replace(" ", "T")),
          court: court || null,
          players: bte.players,
          duration: preserveDuration ? duration : 0,
          facility: facility.id || null,
          association: null,
          maxPlayers: maxPlayers || 0,
          joinable: joinable,
        },
        {
          onSuccess: (mutatedBooking: Booking) => {
            emailDispatcher({
              originalBooking: bte,
              mutatedBooking,
              bookerName: sessionData.user.name || "Someone",
              bookings: [],
              eventType,
              recipients,
              mutation: emailerMutation,
            });
            void router.push("/");
            /*  void refetchBookings().then(() => {
            }); */
          },
        }
      );
    } else {
      const recipients = getEmailRecipients({
        users: users || [],
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
      <SubHeader title="Change booking" />
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {!isInitialLoading && sessionStatus === "unauthenticated" ? (
          <div className="flex h-screen flex-col items-center justify-center p-3">
            <h2 className="text-center text-2xl text-white">
              If you want to add or edit bookings, you have to be logged in.
            </h2>
          </div>
        ) : (
          <div className="container max-w-md p-4">
            {sessionData?.user.id && bte ? (
              <div>
                <ActionModal
                  callback={addBooking}
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

                <JoinableToggle
                  textColor="white"
                  value={joinable}
                  isLoading={isLoadingJoinable}
                  callback={onJoinableChange}
                />
                <DateSelector date={date} time={time} callback={onDateSelect} />

                {router.query.id && (
                  <>
                    <label className="label">
                      <span className="label-text text-white">Players</span>
                    </label>
                    <PlayersTable booking={bte || defaultBooking} />
                  </>
                )}
                <div className="mb-40 flex flex-col justify-center">
                  <div className="w-100 btn-group btn-group-horizontal flex justify-center self-center pt-5">
                    <Link
                      href="/"
                      className={`${
                        validBooking && !isLoadingBookingMutation
                          ? "btn-warning btn"
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
