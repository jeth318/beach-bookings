import Image from "next/image";
import { SubHeader } from "~/components/SubHeader";

const publishBookingSteps = [
  {
    text: "1️⃣ Visit the <a className='link' href='https://gbc.goactivebooking.com/'> official GBC website </a> , place a regular booking and wait for their confirmation email.",
  },
  {
    text: "2️⃣ Here in Beach Bookings, navigate to the top left menu where you will find the Publish-option. Tap it",
  },
  {
    text: "3️⃣ Fill in the details from your GBC booking along with the amount of players required/allowed (defaults to 4).",
  },
  {
    text: "4️⃣ Click the green Save-button. All players will instantly receive an email with info about the new booking.",
  },
];

const faqTexts = [
  {
    title: "Joining",
    text: "Tap the green Join-button (if visible). After confirmation, an email will be sent to the other players in the booking letting them know about the new recruit.",
  },
  {
    title: "Leaving",
    text: "Tap the orange Leave-button (if visible). After confirmation, an email will be sent to the other players in the booking letting them know you left.",
  },
  {
    title: "Changing/editing",
    text: " Log in and tap the top menu icon, then tap Booked-option (visible only for bookings added by you). Selet Delete-option After confirmation, an email will be sent to the other players in the booking with information of the update. Important!",
  },
  {
    title: "Removing",
    text: "Log in and tap the top menu icon, then tap Booked-option (visible only for bookings added by you). Select Delete-option After confirmation, an email will be sent to the other players in the booking with information of the update. Important!",
  },
  {
    title: "Add guest",
    text: "When you join a booking, click the 'date-link' which will take you to a detailed view. There is an option to add one or more guests (depending on available spots left in the booking). Write the name of your gust and hit Add-button. Now your guest will take up a spot and the other players in the booking will get notified by email.",
  },
  {
    title: "Remove guest",
    text: "In the detailed view (click the date-link), you will see the option to 'Remove' guests added by you. If you are the booker, you will also see 'Remove' next to all other players as well, since you are in charge.",
  },
];

const Help = () => {
  return (
    <>
      <SubHeader title="How to" />
      <div className="dark:bg-slate-750 flex flex-col justify-center bg-blue-100 dark:bg-slate-700">
        <Image
          alt="beach-game"
          className="self-center"
          width={300}
          height={300}
          src="/beach-spike.png"
        />
        <div className="flex flex-col items-center justify-center p-2">
          <h2 className="text-center text-lg">
            If you need help or have any questions, contact me at the email
            below:
          </h2>
          <a className="link mt-4 text-xl" href="mailto:admin@beachbookings.se">
            admin@beachbookings.se
          </a>
        </div>
        <br />
        <br />{" "}
        <div className="pl-4 pr-4">
          <p className="mb-4 text-lg font-bold lg:text-xl">
            🌴 Publish a booking
          </p>
          <div className="pl-6 text-lg font-normal text-black dark:text-gray-600 lg:text-xl">
            {publishBookingSteps.map((step, index) => (
              <div
                key={index}
                className="mb-4 text-black dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: step.text }}
              />
            ))}
          </div>
          <br />
          {faqTexts.map((item) => {
            return (
              <>
                <p className="bold mt-4 text-lg font-bold text-black dark:text-gray-100 lg:text-xl">
                  🌴 {item.title}
                </p>
                <div className="pl-6">
                  <p className="mt-2 text-lg font-normal text-black dark:text-gray-300 lg:text-xl">
                    {item.text}
                  </p>
                </div>
              </>
            );
          })}
        </div>
        <br />
        <hr />
        <br />
        <div className="pl-4 pr-4">
          <p className="text-lg font-bold text-black dark:text-gray-100 lg:text-xl">
            💡 About the app
          </p>
          <p className="pl-6 text-lg font-normal text-black dark:text-gray-300 lg:text-xl">
            Chat-GPT, write a short sales pitch on why anyone would use this
            app...
          </p>
          <br />
          <p className="p-2 text-lg font-normal italic text-black dark:text-gray-300 lg:text-xl">
            - Get ready to have a blast with Beach Bookings, the ultimate web
            app for player squad gathering. Say goodbye to boring Google Sheets
            and say hello to an interactive experience that keeps you in the
            loop. With Beach Bookings, you will receive email notifications for
            booking updates, edits, or cancellations in real-time. Do not worry;
            you are in control! Just head to the settings option in the
            top-right corner to customize your email notifications to your
            hearts content.
          </p>
        </div>
      </div>
      <br />
    </>
  );
};

export default Help;
