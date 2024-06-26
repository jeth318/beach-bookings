import { signIn, useSession } from "next-auth/react";

import { type ChangeEvent, useEffect, useState } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { type Association, type Facility } from "@prisma/client";
import { SubHeader } from "~/components/SubHeader";
import { emailDispatcher, maxPlayersToShow } from "~/utils/booking.util";
import { getEmailRecipients } from "~/utils/general.util";
import { BeatLoader } from "react-spinners";
import ActionModal from "~/components/ActionModal";
import { SelectInput } from "~/components/SelectInput";
import { DateSelector } from "~/components/DateSelector";
import { JoinableToggle } from "~/components/JoinableToggle";
import Image from "next/image";
import Link from "next/link";
import useEmail from "../../hooks/useEmail";
import useUser from "../../hooks/useUser";
import useUserAssociations from "../../hooks/useUserAssociations";
import useSingleBooking from "../../hooks/useSingleBooking";
import { getAssociationsToShow } from "~/utils/association.util";
import { PageLoader } from "~/components/PageLoader";
import MainContainer from "~/components/MainContainer";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import useLocalStorage from "~/hooks/useLocalStorage";

const Booking = () => {
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
    api.user.getUserIdsWithAddConsent.useQuery(undefined, {
      enabled: sessionStatus === "authenticated",
    });

  const { createBooking, isLoadingCreateBooking } = useSingleBooking({});

  const { sendEmail } = useEmail();

  const { lss } = useLocalStorage();

  const onJoinableChange = () => {
    setJoinable(!joinable);
  };

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

  useEffect(() => {
    if (!isInitialStateLoaded) {
      if (lss) {
        // Populate from localStorage on mount
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
    }
  }, [isInitialStateLoaded, lss]);

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
        private: privateBooking || false,
      });

      emailDispatcher({
        originalBooking: newBooking,
        recipients,
        bookerName: sessionData.user.name || "Someone",
        bookings: [],
        eventType: "ADD",
        associationId: newBooking.associationId,
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
    const facilityId = selected?.dataset["id"];
    const facilityToSelect = facilities?.find((f) => f.id === facilityId);
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

    setAssociation(associationToSelect);
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
  const onDraftCancel = () => {
    setPreventLocalStorageWrite(true);
    localStorage.removeItem("booking-state");
    router.reload();
    //await router.push("/");
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

  const validBooking =
    !!sessionData?.user.id &&
    !!date &&
    !!time &&
    !!facility &&
    (facility?.courts.length ? !!court : true) &&
    (facility?.durations.length ? !!duration : true);

  const showFacility = () => {
    return !associationsToShow?.length || !privateBooking || !!association;
  };

  const showDateSelector = () => {
    if (!facility) {
      return false;
    }
    const hasDurations = !!facility?.durations.length;
    const hasCourts = !!facility?.courts.length;

    if (hasDurations && hasCourts) {
      return !!duration && !!court;
    }

    if (hasDurations) {
      return !!duration;
    }

    if (hasCourts) {
      return !!court;
    }
  };

  if (sessionStatus === "unauthenticated") {
    return (
      <MainContainer subheading="Publish" bgFrom="[#2e026d]">
        <ArrogantFrog>
          You must be{" "}
          <button className="link" onClick={() => void signIn()}>
            logged in
          </button>{" "}
          to publish bookings.
        </ArrogantFrog>
      </MainContainer>
    );
  }

  if (
    sessionStatus === "loading" ||
    isInitialLoading ||
    !isUserFetched ||
    !isJoinedAssociationsFetched
  ) {
    console.log("HEJ");

    return <PageLoader />;
  }

  if (sessionData?.user.id && !user?.name) {
    return (
      <MainContainer bgFrom="[#2e026d]">
        <div className="flex flex-col justify-center">
          <Image
            alt="beach-spike"
            width={300}
            height={300}
            src="/beach-spike.png"
          />
          <h2 className="mb-4 text-4xl">Hello stranger! 👋</h2>
          <h3 className="text-center text-xl">
            If you want to publish or join a booking, you must first add your
            name in your account.
          </h3>
          <Link href="/settings" className="btn-info btn mt-10 w-32 ">
            Settings
          </Link>
        </div>
      </MainContainer>
    );
  }

  return (
    <>
      <SubHeader title={"Publish booking"} />
      <MainContainer heightType="h-full">
        <div className="flex max-w-md flex-col justify-center self-center p-2">
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
              All beach bookers with notifications enabled will receive an email
              about the new booking. Your email address will be visible for the
              other players in this booking.
            </p>
          </ActionModal>
          <ActionModal
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            callback={onDraftCancel}
            data={undefined}
            tagRef={`booking-cancel`}
            title="Are you sure?"
            level="warning"
            confirmButtonText={"Reset"}
            cancelButtonText="Keep editing"
          >
            <div className="py-4">
              <p>
                This draft will be removed and you will have to re-enter the the
                booking information.
              </p>
            </div>
          </ActionModal>

          <div className="mt-4 flex flex-col gap-4">
            <div className="1px solid rounded-md border border-slate-500 p-2">
              <JoinableToggle
                textColor="white"
                value={joinable}
                callback={onJoinableChange}
              />
              <SelectInput
                optionSuffix="players"
                label="Players"
                description="How many can play?"
                disabledOption="Players required (including you)"
                valid
                value={maxPlayers}
                items={maxPlayersToShow}
                callback={onMaxPlayersSelect}
              />
            </div>
            {!!associationsToShow.length && (
              <div className="1px solid rounded-md border border-slate-500 p-2">
                <label className="label">
                  <span className="label-text ">
                    Visible for everyone or for a private group only?
                  </span>
                </label>
                <div className="w-100 btn-group-veri btn-group flex justify-center self-center">
                  <button
                    onClick={() => {
                      setPrivateBooking(false);
                      setAssociation(null);
                    }}
                    className={`btn-${
                      privateBooking ? "inactive" : "active"
                    } btn  w-[50%] `}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setPrivateBooking(true)}
                    style={{ position: "relative" }}
                    className={`btn btn-${
                      privateBooking ? "active" : "inactive"
                    } w-[50%] `}
                  >
                    Private
                  </button>
                </div>
                {!!associationsToShow.length && privateBooking && (
                  <SelectInput
                    label="Group"
                    disabled={!privateBooking}
                    disabledOption="Select group"
                    valid={!privateBooking || !!association}
                    value={association?.name || "Select group"}
                    items={associationsToShow}
                    callback={onAssociationSelect}
                  />
                )}
              </div>
            )}

            {showFacility() && (
              <div className="1px solid rounded-md border border-slate-500 p-2">
                {facility?.name === "GBC Kviberg" && (
                  <div className="alert alert-info mt-2 flex flex-row text-sm ">
                    <div>
                      <Image
                        className="mr-2 rounded-full shadow-sm shadow-black"
                        alt="arrogant-frog"
                        src="/cig-frog.gif"
                        width={55}
                        height={55}
                      />
                      <p>
                        <b>Yo!</b> Make sure that you book a court at{" "}
                        <a
                          target="_blank"
                          className="text-blue link"
                          href="https://gbc.goactivebooking.com/book-service/27?facility=1"
                        >
                          {" "}
                          {facility.name}
                        </a>{" "}
                        and receive a confirmation email before publishing here.
                      </p>
                    </div>
                  </div>
                )}

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
              </div>
            )}
            {showDateSelector() && (
              <div className="smooth-render-in">
                <DateSelector date={date} time={time} callback={onDateSelect} />
              </div>
            )}
          </div>

          <div className="mb-20 mt-10 flex flex-col items-center justify-center gap-2 pb-4">
            <label
              htmlFor="action-modal-booking-cancel"
              className="btn-outline btn w-[200px]  text-white"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
            >
              Reset
            </label>

            <label
              className={`${
                validBooking ? "btn-success" : "btn-disabled"
              } btn w-[200px]`}
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
      </MainContainer>
    </>
  );
};

export default Booking;
