import { type NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";
import { Header } from "~/components/Header";
import { Bookings } from "~/components/Bookings";
import { BeatLoader } from "react-spinners";
import Image from "next/image";

const Home: NextPage = () => {
  const { isInitialLoading: isInitialLoadingBookings, data: bookings } =
    api.booking.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Beach bookings</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      {isInitialLoadingBookings || !bookings?.length ? (
        <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
          {isInitialLoadingBookings ? (
            <div className="flex flex-col items-center justify-center">
              <h2 className="pb-4 text-2xl text-white">Loading bookings</h2>
              <BeatLoader size={20} color="#36d7b7" />
            </div>
          ) : (
            <div className="flex flex-col">
              <Image
                className="self-center pb-4"
                style={{ borderRadius: "50%" }}
                alt="frog"
                src="/cig-frog.gif"
                width={200}
                height={200}
              />
              <h2 className="text-2xl text-white">No bookings found! 😥🌴</h2>
            </div>
          )}
        </div>
      ) : (
        <main className="h-screen" style={{ backgroundColor: "currentcolor" }}>
          <div className="min-w-sm flex min-w-fit flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            <Bookings />
          </div>
        </main>
      )}
    </>
  );
};

export default Home;
