import { type Booking } from "@prisma/client";
import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { SubHeader } from "~/components/SubHeader";
import { type GbcBooking } from "~/server/api/routers/gbc-proxy";
import { api } from "~/utils/api";
import { serverSideHelpers } from "~/utils/staticPropsUtil";

export async function getStaticProps() {
  await serverSideHelpers.booking.getAll.prefetch();
  return {
    props: {
      trpcState: serverSideHelpers.dehydrate(),
    },
    revalidate: 1,
  };
}

const Gbc = () => {
  const [gbcEmail, setGbcEmail] = useState<string | undefined>();
  const [gbcPass, setGbcPass] = useState<string>();
  const [accessTokenFromStorage, setAccessTokenFromStorage] = useState<
    string | undefined | null
  >();
  useEffect(() => {
    setAccessTokenFromStorage(localStorage.getItem("x-jwt-auth-gbc"));
  }, []);

  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const bookingMutation = api.booking.create.useMutation();

  const { data: gbcAccount, refetch: refetchGbcAccount } =
    api.gbcProxy.getForUser.useQuery();
  const gbcUnlinkMutation = api.gbcProxy.delete.useMutation();

  const { data: gbcBookings, refetch: refetchGbcBookings } =
    api.gbcProxy.getGbcBookings.useQuery(
      {
        accessToken: accessTokenFromStorage || "",
      },
      {
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        enabled: false,
      }
    );

  const linkAccount = () => {
    if (gbcEmail && gbcPass) {
      gbcLinkMutation.mutate(
        {
          email: gbcEmail,
          password: gbcPass,
        },
        {
          onSuccess: () => {
            void refetchGbcAccount();
            void refetchGbcBookings();
          },
        }
      );
    }
  };

  const unlinkAccount = () => {
    if (gbcAccount) {
      gbcUnlinkMutation.mutate(
        { id: gbcAccount.id },
        {
          onSuccess: () => {
            localStorage.removeItem("x-jwt-auth-gbc");
          },
        }
      );
    }
  };

  const gbcLinkMutation = api.gbcProxy.linkAccount.useMutation({
    onSuccess: (data) => {
      if (data?.access_token) {
        localStorage.setItem("x-jwt-auth-gbc", data.access_token);
      }
    },
  });

  const readAccount = () => {
    if (gbcEmail && gbcPass) {
      //gbcLinkMutation({ email: gbcEmail, password: gbcPass });
    }
  };

  const readGBCBookings = async () => {
    await refetchGbcBookings();
    if (gbcBookings) {
      console.log(accessTokenFromStorage);
    }
  };

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <div>
      <SubHeader title="Gbc-link" />

      <div className="flex flex-col justify-center">
        <div className="form-control">
          <label className="label">
            <span className="label-text">GBC-email</span>
          </label>
          <label className="input-group">
            <span>GBC-Email</span>
            <input
              onChange={(e) => {
                setGbcEmail(e.target.value);
              }}
              type="text"
              placeholder="info@site.com"
              className="input-bordered input"
            />
          </label>
          <label className="label">
            <span className="label-text">GBC-password</span>
          </label>
          <label className="input-group">
            <span>GBC-password</span>
            <input
              onChange={(e) => {
                setGbcPass(e.target.value);
              }}
              type="text"
              placeholder="info@site.com"
              className="input-bordered input"
            />
          </label>
          <br />
          <button
            onClick={() => {
              gbcAccount?.id ? unlinkAccount() : linkAccount();
            }}
            className={`btn-${
              !!gbcAccount ? "warning" : "success"
            } btn text-white`}
          >
            {!!gbcAccount ? "Unlink" : "Link"} my GBC-account
          </button>
          <br />

          <button
            onClick={() => {
              void readGBCBookings();
            }}
            className="btn-success btn text-white"
          >
            Read GBC-bookings
          </button>
          <br />

          <button
            onClick={() => {
              void syncGBCBookings();
            }}
            className="btn-success btn text-white"
          >
            Sync GBC-bookings
          </button>
        </div>
        <div>
          {gbcBookings?.data?.map((booking: GbcBooking) => {
            return (
              <div key={booking?.order.id} className="flex justify-center p-8">
                <div>{booking.duration.start}</div>
                <div>{booking.duration.end}</div>
                <div>{booking.customer.firstName}</div>
                <div>{booking.customer.lastName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Gbc;
