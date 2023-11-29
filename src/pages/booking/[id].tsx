import { signIn, useSession } from "next-auth/react";

import { type ChangeEvent, useState, useEffect } from "react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { type Association, Booking, type Facility } from "@prisma/client";

import { emailDispatcher, maxPlayersToShow } from "~/utils/booking.util";
import {
  getEmailRecipients,
  getQueryId,
  renderToast,
} from "~/utils/general.util";
import { BeatLoader } from "react-spinners";
import ActionModal from "~/components/ActionModal";
import { JoinableToggle } from "~/components/JoinableToggle";
import { SelectInput } from "~/components/SelectInput";
import { DateSelector } from "~/components/DateSelector";
import { Toast } from "~/components/Toast";
import useEmail from "../../hooks/useEmail";
import useUsersInBooking from "../../hooks/useUsersInBooking";
import useSingleBooking from "../../hooks/useSingleBooking";
import useUserAssociations from "../../hooks/useUserAssociations";
import useUser from "../../hooks/useUser";
import { getFacilitiesToShow } from "~/utils/facility.util";
import { getAssociationsToShow } from "~/utils/association.util";
import useGuest from "~/hooks/useGuest";
import MainContainer from "~/components/MainContainer";
import { PageLoader } from "~/components/PageLoader";
import { ArrogantFrog } from "~/components/ArrogantFrog";
import { parseTime } from "~/utils/time.util";

const Booking = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const router = useRouter();
  const [court, setCourt] = useState<string | null>();
  const [duration, setDuration] = useState<number | null>();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [facility, setFacility] = useState<Facility | null>();
  const [association, setAssociation] = useState<Association | null>();
  const [maxPlayers, setMaxPlayers] = useState<number>();
  const [joinable, setJoinable] = useState<boolean>();
  const [privateBooking, setPrivateBooking] = useState<boolean>();
  const [toastMessage, setToastMessage] = useState<string>();
  const [isInitialStateLoaded, setIsInitialStateLoaded] = useState<boolean>();

  const session = useSession();
  const isInitialLoading = sessionStatus === "loading";

  const { user } = useUser({ email: session.data?.user.email });
  const { sendEmail } = useEmail();

  const {
    updateBooking,
    updateBookingJoinable,
    booking,
    isLoadingUpdateBookingJoinable,
    isLoadingUpdateBooking,
    refetchBooking,
  } = useSingleBooking({ id: getQueryId(router) });

  const { allGuestsInBooking } = useGuest({ bookingId: booking?.id });
  const { usersInBooking, isUsersInBookingFetched } = useUsersInBooking({
    booking,
  });

  const { joinedAssociations, isJoinedAssociationsFetched } =
    useUserAssociations({ associationIds: user?.associations });

  const { data: facilities, isFetched: areFacilitiesFetched } =
    api.facility.getAll.useQuery();

  const onUpdateBookingJoinableSuccess = (mutatedBooking: Booking) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setJoinable(mutatedBooking?.joinable);
    renderToast(
      `Your booking is ${!joinable ? "now joinable." : "no longer joinble."}`,
      setToastMessage
    );
  };

  const onJoinableChange = async () => {
    if (!booking) {
      setJoinable(!joinable);
      return null;
    }
    try {
      const updatedBooking = await updateBookingJoinable({
        id: booking.id,
        joinable: !joinable,
      });
      onUpdateBookingJoinableSuccess(updatedBooking);
    } catch (error) {}
  };

  const mainContainerProps = {
    subheading: "Edit booking",
    bgFrom: "#02968f91",
    bgTo: "#000000",
    heightType: "h-full",
  };

  const facilitiesToShow = getFacilitiesToShow(facilities);
  const associationsToShow = getAssociationsToShow(joinedAssociations);

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

  const onBookingUpdateConfirmed = async () => {
    if (!validBooking || !booking) {
      return null;
    }

    const formattedDate = date?.toLocaleString("sv-SE");

    const recipients = getEmailRecipients({
      users: usersInBooking || [],
      playersInBooking: booking.players,
      sessionUserId: sessionData?.user.id,
      eventType: "MODIFY",
    });

    const preserveDuration =
      duration !== undefined &&
      facility.durations.find((dur) => dur === duration?.toString()) !==
        undefined;

    await updateBooking(
      {
        id: booking.id,
        date: new Date(formattedDate.replace(" ", "T")),
        court: court || null,
        players: booking.players,
        duration: preserveDuration ? duration : 0,
        facility: facility.id || null,
        association: association?.id || null,
        maxPlayers: maxPlayers || 0,
        joinable: joinable || false,
        private: privateBooking || false,
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
            guests: allGuestsInBooking,
            associationId: booking.associationId,
            sendEmail,
          });
          refetchBooking().catch(() => null);
          renderToast("Your booking details were updated", setToastMessage);
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

  const isLoading =
    sessionStatus === "loading" ||
    isInitialLoading ||
    !isInitialStateLoaded ||
    !isJoinedAssociationsFetched ||
    !isUsersInBookingFetched;

  useEffect(() => {
    if (
      isInitialStateLoaded ||
      !areFacilitiesFetched ||
      !booking ||
      !isJoinedAssociationsFetched
    ) {
      return undefined;
    }

    if (booking.joinable !== undefined) {
      setJoinable(booking.joinable);
    }

    if (booking.private !== undefined) {
      setPrivateBooking(booking.private);
    }

    if (!facility && !!facilities?.length) {
      setFacility(
        facilities.find((facility) => facility.id === booking?.facilityId)
      );
    }

    if (
      !association &&
      !!joinedAssociations?.length &&
      !!booking.associationId
    ) {
      setAssociation(
        joinedAssociations?.find((assoc) => assoc.id === booking.associationId)
      );
    }

    if (!maxPlayers) {
      setMaxPlayers(booking.maxPlayers || 4);
    }

    if (!date) {
      setDate(booking.date);
    }
    if (date && !time) {
      setTime(
        date?.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    if (facility) {
      if (!duration) {
        setDuration(booking.duration);
      }

      if (!court) {
        setCourt(booking.court);
      }
      setIsInitialStateLoaded(true);
    }
  }, [
    areFacilitiesFetched,
    booking,
    association,
    court,
    date,
    duration,
    facilities,
    facility,
    isUsersInBookingFetched,
    joinedAssociations,
    maxPlayers,
    time,
    isInitialStateLoaded,
    isJoinedAssociationsFetched,
  ]);

  if (isLoading) {
    return (
      <MainContainer {...mainContainerProps}>
        <PageLoader />
      </MainContainer>
    );
  }

  if (sessionStatus === "unauthenticated") {
    return (
      <MainContainer {...mainContainerProps}>
        <ArrogantFrog>
          <div>
            You must be{" "}
            <button className="link" onClick={() => void signIn()}>
              logged in
            </button>{" "}
            to edit bookings.
          </div>
        </ArrogantFrog>
      </MainContainer>
    );
  }

  return (
    <MainContainer {...mainContainerProps}>
      <ActionModal
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        callback={onBookingUpdateConfirmed}
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
          All players in this booking will receive an email about the updated
          booking details.
        </p>
      </ActionModal>
      {toastMessage && <Toast body={toastMessage} />}
      <div className="p-2 pl-2 pt-6">
        <div className="mb-4 text-center text-white">
          <h2 className="text-2xl">
            {booking?.date.toLocaleDateString("sv-SE")}
          </h2>
          <h4>{booking && parseTime(booking)}</h4>
        </div>
        <div className="flex flex-col gap-4">
          <div className="1px solid rounded-md border border-slate-100 p-2">
            <JoinableToggle
              textColor="white"
              value={joinable || false}
              isLoading={isLoadingUpdateBookingJoinable}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              callback={onJoinableChange}
            />
            <SelectInput
              label="Players"
              optionSuffix="players"
              description="How many players are required/allowed?"
              valid={!!maxPlayers}
              value={String(maxPlayers) || "Players"}
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
                    setAssociation(undefined);
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

          <div className="1px solid rounded-md border border-slate-500 p-2">
            <SelectInput
              disabled
              label="Facility"
              description="Where are you playing? (more to come later)"
              valid={!!facility}
              value={facility?.name || "Pick a place"}
              items={facilitiesToShow}
              callback={onFacilitySelect}
            />
            {!!facility?.durations?.length && (
              <SelectInput
                label="Duration"
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
                valid={!!court}
                value={court || "Pick court"}
                items={facility.courts.map((item) => ({
                  id: item,
                  name: item,
                }))}
                callback={onCourtSelect}
              />
            )}
          </div>

          <DateSelector date={date} time={time} callback={onDateSelect} />
        </div>
        <div className="flex flex-col justify-center">
          <div className="w-100  mb-20 mt-10 flex justify-center self-center">
            <label
              style={{ position: "relative" }}
              className={`${
                validBooking && !isLoadingUpdateBooking
                  ? "btn-success"
                  : "btn-disabled"
              } btn `}
              htmlFor="action-modal-booking"
            >
              Save changes
            </label>
          </div>
          {isLoadingUpdateBooking && (
            <div className="mt-4 flex justify-center">
              <BeatLoader size={15} color="white" />
            </div>
          )}
        </div>
      </div>
    </MainContainer>
  );
};

export default Booking;
