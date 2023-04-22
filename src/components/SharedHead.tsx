import Head from "next/head";

type Props = {
  title?: string;
  description?: string;
};
export const SharedHead = ({ title, description }: Props) => {
  return (
    <Head>
      <title>{title || "Beach Bookings"}</title>
      <meta
        name="description"
        content={description || "Beach bookings makes party's happen"}
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="application-name" content="BeachBookings" />
      <meta name="apple-mobile-web-app-title" content="Beach Bookings" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      <link rel="apple-touch-icon" href="/beach-player-generic.png" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};
