import { useSession } from "next-auth/react";

import { type ChangeEvent, useEffect, useState } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { type Association, type Facility } from "@prisma/client";
import { SubHeader } from "~/components/SubHeader";
import { emailDispatcher } from "~/utils/booking.util";
import { getEmailRecipients } from "~/utils/general.util";
import { BeatLoader } from "react-spinners";
import ActionModal from "~/components/ActionModal";
import { serverSideHelpers } from "~/utils/staticPropsUtil";
import { SelectInput } from "~/components/SelectInput";
import { DateSelector } from "~/components/DateSelector";
import { JoinableToggle } from "~/components/JoinableToggle";
import { getPrePopulationState } from "~/utils/storage";
import Image from "next/image";
import Link from "next/link";
import useEmail from "../hooks/useEmail";
import useUser from "../hooks/useUser";
import useUserAssociations from "../hooks/useUserAssociations";
import useSingleBooking from "../hooks/useSingleBooking";
import { getAssociationsToShow } from "~/utils/association.util";
import { Toggle } from "~/components/Toggle";

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
  const router = useRouter();
  const [court, setCourt] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [facility, setFacility] = useState<Facility | null>();
  const [association, setAssociation] = useState<Association | null>();
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [joinable, setJoinable] = useState<boolean>(true);
  const [privateBooking, setPrivateBooking] = useState<boolean>(true);
  const [preventLocalStorageWrite, setPreventLocalStorageWrite] =
    useState<boolean>(false);

  const [isInitialStateLoaded, setIsInitialStateLoaded] =
    useState<boolean>(false);
  const { user, isUserFetched } = useUser({
    email: sessionData?.user.email,
  });
  const { data: facilities } = api.facility.getAll.useQuery();

  const { joinedAssociations, isJoinedAssociationsFetched } =
    useUserAssociations({
      associationIds: user?.associations,
    });

  const { data: usersWithAddConsent } =
    api.user.getUserIdsWithAddConsent.useQuery();

  const { createBooking, isLoadingCreateBooking } = useSingleBooking({});

  const { sendEmail } = useEmail();

  const onJoinableChange = () => {
    setJoinable(!joinable);
  };

  const onPrivateBookingChange = () => {
    if (!privateBooking === false) {
      setAssociation(undefined);
    }
    setPrivateBooking(!privateBooking);
  };

  // localStorageState
  const lss = getPrePopulationState(facilities);

  const setPrePopulateBookingState = () => {
    const now = new Date();
    // Five minutes
    const ttl = 60000 * 5;
    const data = {
      value: {
        court,
        association,
        duration,
        time,
        date,
        facility,
        maxPlayers,
        joinable,
        privateBooking,
      },
      expiry: now.getTime() + ttl,
    };

    localStorage.setItem("booking-state", JSON.stringify(data));
  };

  const isInitialLoading = sessionStatus === "loading";

  // Populate from localStorage on mount
  const setInitialState = () => {
    if (lss) {
      setDuration(lss?.duration);
      setCourt(lss?.court);
      setFacility(lss?.facility);
      setMaxPlayers(lss?.maxPlayers || 4);
      setTime(lss?.time);
      setAssociation(lss?.association);
      setPrivateBooking(lss?.privateBooking);
      setIsInitialStateLoaded(true);

      if (lss?.date !== null && lss?.date !== undefined) {
        setDate(new Date(lss?.date));
      }

      if (lss?.time !== null && lss?.time !== undefined) {
        setTime(lss.time);
      }
    }
  };

  useEffect(() => {
    if (!isInitialStateLoaded) {
      setInitialState();
    }
  }, [lss]);

  useEffect(() => {
    if (!preventLocalStorageWrite) {
      setPrePopulateBookingState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    court,
    duration,
    time,
    date,
    association,
    facility,
    maxPlayers,
    joinable,
    privateBooking,
    preventLocalStorageWrite,
  ]);

  const onPublishClicked = async () => {
    if (!validBooking) {
      return null;
    }

    const formattedDate = date?.toLocaleString("sv-SE");

    const recipients = getEmailRecipients({
      users: usersWithAddConsent || [],
      playersInBooking: [],
      sessionUserId: sessionData?.user.id || "",
      eventType: "ADD",
    });

    console.log("association?.id", association?.id);

    try {
      const newBooking = await createBooking({
        userId: sessionData?.user.id,
        date: new Date(formattedDate.replace(" ", "T")),
        court: court || null,
        facilityId: facility?.id || null,
        associationId: association?.id || null,
        duration: duration || null,
        maxPlayers: maxPlayers === undefined ? 0 : maxPlayers,
        joinable: joinable,
        private: privateBooking,
      });

      emailDispatcher({
        originalBooking: newBooking,
        recipients,
        bookerName: sessionData.user.name || "Someone",
        bookings: [],
        eventType: "ADD",
        sendEmail,
      });

      void router.push("/");
      setPreventLocalStorageWrite(true);
      localStorage.removeItem("booking-state");
    } catch (error) {}
  };

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
    console.log({ selected });

    const facilityId = selected?.dataset["id"];
    const facilityToSelect = facilities?.find((f) => f.id === facilityId);
    console.log("EF", facilityToSelect);

    setFacility(facilityToSelect);

    setCourt(null);
    setDuration(null);
  };

  const onAssociationSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.options[event.target.selectedIndex];
    const associationId = selected?.dataset["id"];
    const associationToSelect = joinedAssociations?.find(
      (f) => f.id === associationId
    );

    associationToSelect && setAssociation(associationToSelect);
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
  const onDraftCancel = async () => {
    setPreventLocalStorageWrite(true);
    localStorage.removeItem("booking-state");
    await router.push("/");
    return undefined;
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

  const associationsToShow = getAssociationsToShow(joinedAssociations);
  const maxPlayersToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
    (item) => ({
      id: String(item),
      name: String(item),
    })
  );

  const validBooking =
    !!sessionData?.user.id &&
    !!date &&
    !!time &&
    (privateBooking ? !!association : true) &&
    !!facility &&
    (facility?.courts.length ? !!court : true) &&
    (facility?.durations.length ? !!duration : true);

  if (isInitialLoading || !isUserFetched || !isJoinedAssociationsFetched) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <BeatLoader size={20} color="white" />
      </div>
    );
  }

  if (sessionData?.user.id && !user?.name) {
    return (
      <main className="min-w-sm pd-3 flex min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex flex-col items-center p-3">
          <Image
            alt="beach-spike"
            width={300}
            height={300}
            src="/beach-spike.png"
          />
          <h2 className="mb-4 text-4xl text-white">Hello stranger! 👋</h2>
          <h3 className="text-center text-xl text-white">
            If you want to publish or join a booking, you must first add your
            name in your account.
          </h3>
          <Link href="/settings" className="btn btn-info mt-10 text-white">
            Settings
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <SubHeader title={"Publish booking"} />
      <main className="min-w-sm pd-3 flex flex min-w-fit flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {!isInitialLoading && sessionStatus === "unauthenticated" ? (
          <div className="flex flex-col items-center justify-center p-3">
            <h2 className="text-center text-2xl text-white">
              If you want to add or edit bookings, you have to be logged in.
            </h2>
          </div>
        ) : (
          <div className="smooth-render-in container max-w-md p-4">
            {sessionData?.user.id && (
              <div>
                <ActionModal
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  callback={onPublishClicked}
                  data={undefined}
                  tagRef={`booking`}
                  title="Confirm new booking 🏖️"
                  confirmButtonText={"Publish"}
                  cancelButtonText="Cancel"
                  level="success"
                >
                  <p className="py-4">
                    All beach bookers with notifications enabled will receive an
                    email about the new booking.
                  </p>
                </ActionModal>
                <ActionModal
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  callback={onDraftCancel}
                  data={undefined}
                  tagRef={`booking-cancel`}
                  title="Are you sure?"
                  confirmButtonText={"Yesbox"}
                  cancelButtonText="Keep editing"
                >
                  <div className="py-4">
                    <p>
                      This draft will be removed and you will have to re-enter
                      the the booking information.
                    </p>
                  </div>
                </ActionModal>
                <div className="alert alert-info mt-2 flex flex-row text-white">
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
                <div className="mb-4 mt-4">
                  <JoinableToggle
                    textColor="white"
                    value={joinable}
                    callback={onJoinableChange}
                  />
                </div>
                {!!associationsToShow.length && (
                  <div className="mb-4 mt-4">
                    <Toggle
                      textColor="white"
                      title="Private"
                      svgPath="/svg/group.svg"
                      message="Make visible for chosen group only. You can change this at anytime."
                      value={privateBooking}
                      callback={onPrivateBookingChange}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {!!associationsToShow.length && (
                    <SelectInput
                      label="Group"
                      disabled={!privateBooking}
                      disabledOption="Select group"
                      description="With what group do you want to play?"
                      valid={!!association}
                      value={association?.name || "Select group"}
                      items={associationsToShow}
                      callback={onAssociationSelect}
                    />
                  )}

                  <SelectInput
                    label="Players"
                    description="How many players are required/allowed?"
                    valid={!!maxPlayers}
                    value={String(maxPlayers) || "Players"}
                    items={maxPlayersToShow}
                    callback={onMaxPlayersSelect}
                  />

                  <SelectInput
                    disabledOption="Pick a place"
                    label="Facility"
                    description="Where are you playing? (more to come)"
                    valid={!!facility}
                    value={facility?.name || "Pick a place"}
                    items={facilitiesToShow}
                    callback={onFacilitySelect}
                  />

                  {!!facility?.durations?.length && (
                    <div className="smooth-render-in">
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
                    </div>
                  )}

                  {!!facility?.courts.length && (
                    <div className="smooth-render-in">
                      <SelectInput
                        label="Court"
                        disabledOption="Select court"
                        description="Which court?"
                        valid={!!court}
                        value={court || "Select court"}
                        items={facility.courts.map((item) => ({
                          id: item,
                          name: item,
                        }))}
                        callback={onCourtSelect}
                      />
                    </div>
                  )}

                  <DateSelector
                    date={date}
                    time={time}
                    callback={onDateSelect}
                  />
                </div>

                <div className="w-100 btn-group btn-group-horizontal mb-20 mt-10 flex justify-center self-center">
                  <label
                    htmlFor="action-modal-booking-cancel"
                    className="btn btn-warning text-white"
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  >
                    Cancel
                  </label>

                  <label
                    style={{ position: "relative" }}
                    className={`${
                      validBooking ? "btn-success" : "btn-disabled"
                    } btn text-white`}
                    htmlFor="action-modal-booking"
                  >
                    Publish
                    {isLoadingCreateBooking && (
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
