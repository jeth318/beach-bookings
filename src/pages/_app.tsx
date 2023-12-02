import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";
import { Layout } from "~/components/Layout";
import "~/styles/globals.css";
import { SharedHead } from "~/components/SharedHead";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <link rel="stylesheet" href="https://use.typekit.net/cxl1pgb.css" />
      </Head>
      <SharedHead />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
