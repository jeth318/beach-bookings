import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { Bookings } from "~/components/Bookings";
import { api } from "~/utils/api";
import { SubHeader } from "~/components/SubHeader";
import { serverSideHelpers } from "~/utils/staticPropsUtil";
import { PageLoader } from "~/components/PageLoader";

export async function getStaticProps() {
  await serverSideHelpers.booking.getAll.prefetch();
  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const Help = () => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const bookingsQuery = api.booking.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (bookingsQuery.status !== "success") {
    // won't happen since we're using `fallback: "blocking"`
    return <>Loading...</>;
  }

  if (sessionStatus === "loading") {
    return (
      <PageLoader
        isMainPage={false}
        mainBgColor={"mainPageBgColor"}
        bgColor={"bg-gradient-to-b from-[#01797391] to-[#000000]"}
      />
    );
  }

  return (
    <main className="min-w-sm flex min-w-fit flex-col">
      <SubHeader title="Help" />
      <div
        style={{
          padding: 10,
          paddingTop: 30,
          maxWidth: 600,
        }}
      >
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-sky-400 to-emerald-600 bg-clip-text text-transparent">
            How to beach book
          </span>{" "}
          <br />
          Some advices.
        </h1>
        <p className="text-lg font-normal italic text-gray-500 dark:text-gray-400 lg:text-xl">
          Get ready to have a blast with Beach Bookings, "the ultimate" web app
          for player squad gathering. Say goodbye to boring Google Sheets and
          say hello to an interactive experience that keeps you in the loop.
          With Beach Bookings, you'll receive email notifications for booking
          updates, edits, or cancellations in real-time. Don't worry; you're in
          control! Just head to the settings option in the top-right corner to
          customize your email notifications to your heart's content.
        </p>
        <br />
        <br />
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Add a new booking
        </p>
        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          1️⃣ Start by visiting the{" "}
          <a className="link" href="https://gbc.goactivebooking.com/">
            official GBC website
          </a>{" "}
          and proceed with your booking as you normally would. It's essential to
          receive the confirmation email for your booking from GBC before
          proceeding to the next step. Nobody wants the disappointment of
          arriving at the facility only to find out there's no reservation on
          record!
        </p>
        <br />
        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          2️⃣ Now, log in to Beach Bookings and navigate to the top left menu
          where you'll find the "Add" option.
        </p>
        <br />
        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          3️⃣ Select "Add" and then proceed to input all the necessary details
          from your GBC booking. This includes information like the date, time,
          facility, court, your group (which is currently one big group), and
          the number of players needed or allowed (usually defaults to 4).
        </p>
        <br />
        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          4️⃣ When all required information is entered, the Save-button will turn
          green. Click save and your now booking will be added. Enjoy your game
          on the beach! 🏖️🏐
        </p>
        <br />
        <p className="bold text-lg font-bold  text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Join booking
        </p>
        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          When logged in, simply tap "Join" in in the booking and confirm. When
          joining, an email will be sent to the other players in the booking.
        </p>
        <br />
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Leave booking
        </p>
        <p className="text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          When logged in, go to Joined in the menu and tap and confirm on the
          orange leave-button. Make sure to be logged in, otherwise the actions
          such as leave wont be visible. When leaving, an email will be sent to
          the other players in the booking.
        </p>
        <br />
      </div>
    </main>
  );
};

export default Help;
