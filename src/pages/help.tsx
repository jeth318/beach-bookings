import Image from "next/image";
import MainContainer from "~/components/MainContainer";

const Help = () => {
  return (
    <MainContainer subheading="Help">
      <>
        <Image
          alt="beach-game"
          className="self-center"
          width={300}
          height={300}
          src="/beach-spike.png"
        />
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-center text-lg">
            If you need help or have any questions, contact me at the email
            below:
          </h2>
          <a className="link mt-4 text-xl" href="mailto:admin@beachbookings.se">
            admin@beachbookings.se
          </a>
        </div>
        <br />
        <br />
{/*         <div className="p-4">
          <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
            🌴 Publish a booking
          </p>
          <div className="pl-6 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
            1️⃣ Visit the{" "}
            <a className="link" href="https://gbc.goactivebooking.com/">
              official GBC website
            </a>
            , place a regular booking and wait for their confirmation email.
            <p className="mt-2 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
              2️⃣ Here in Beach Bookings, navigate to the top left menu where you
              will find the Publish-option. Tap it.
            </p>
            <p className="mt-2 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
              3️⃣ Fill in the details from your GBC booking along with the amount
              of players required/allowed (defaults to 4).
            </p>
            <p className="mt-2 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
              4️⃣ Click the green Save-button. All players will instantly receive
              an email with info about the new booking.
            </p>
          </div>
          <br />
        </div> */}
      </>

      {/*  <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Publish a booking
          </p>
          <p className="pl-6 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          1️⃣ Visit the{" "}
          <a className="link" href="https://gbc.goactivebooking.com/">
          official GBC website
          </a>{" "}
          , place a regular booking and wait for their confirmation email.
          </p>
          <br />
          <p className="pl-4 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          2️⃣ Here in Beach Bookings, navigate to the top left menu where you
          will find the Publish-option. Tap it.
          </p>
        <br />
        <p className="pl-2 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          3️⃣ Fill in the details from your GBC booking along with the amount of
          players required/allowed (defaults to 4).
        </p>
        <br />
        <p className="pl-2 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          4️⃣ Click the green Save-button. All players will instantly receive an
          email with info about the new booking.
        </p>
        <br />
        <hr />
        <br />
        <p className="bold text-lg font-bold  text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Join booking
        </p>
        <p className="pl-6 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          Log in and tap the green Join-button (if visible). After confirmation,
          an email will be sent to the other players in the booking letting them
          know about the new recruit.
        </p>
        <br />
        <hr />
        <br />
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Leave booking
        </p>
        <p className="pl-4 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          Log in and tap the orange Leave-button (if visible). After
          confirmation, an email will be sent to the other players in the
          booking letting them know you left.
        </p>
        <br />
        <hr />
        <br />
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Change/Edit booking
        </p>
        <p className="pl-1 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          Log in and tap the top menu icon, then tap Booked-option (visible only
          for bookings added by you). After confirmation, an email will be sent
          to the other players in the booking with information of the update.
        </p>
        <br />
        <hr />
        <br />
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
          🌴 Remove booking
        </p>
        <p className="pl-4 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          Log in and tap the top menu icon, then tap Booked-option (visible only
          for bookings added by you). Selet Delete-option After confirmation, an
          email will be sent to the other players in the booking with
          information of the update. Important!
        </p>
        <br />
        <hr />
        <br />
        <p className="text-lg font-bold text-gray-500 dark:text-gray-400 lg:text-xl">
          💡 About the app
        </p>
        <p className="pl-6 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-xl">
          Chat-GPT, write a short sales pitch on why anyone would use this
          app...
        </p>
        <br />
        <p className="p-2 text-lg font-normal italic text-gray-500 dark:text-gray-400 lg:text-xl">
          - Get ready to have a blast with Beach Bookings, the ultimate web app
          for player squad gathering. Say goodbye to boring Google Sheets and
          say hello to an interactive experience that keeps you in the loop.
          With Beach Bookings, you will receive email notifications for booking
          updates, edits, or cancellations in real-time. Do not worry; you are
          in control! Just head to the settings option in the top-right corner
          to customize your email notifications to your hearts content.
        </p> */}
    </MainContainer>
  );
};

export default Help;
