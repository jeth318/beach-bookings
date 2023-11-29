import Image from "next/image";

export const CheckAvailability = () => {
  return (
    <div className=" flex flex-col items-center self-end pb-4">
      <div className="flex items-center pt-6">
        <Image src="/gbc-logo.png" alt="/gbc-logo.png" height={35} width={35} />
        <div className="pl-4">
          <a
            target="_blank"
            className="btn-info btn "
            href="https://gbc.goactivebooking.com/book-service/27?facility=1"
          >
            Check availability
          </a>
        </div>
      </div>
      <p className="pt-4 text-left text-sm text-slate-300">
        1. Go to GBC to make an actual booking.
        <br />
        2. Make sure to get the order confirmation email
        <br />
        3. Add the booking here for others to see and join
      </p>
    </div>
  );
};
