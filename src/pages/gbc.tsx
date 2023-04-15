import { useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { useState } from "react";
import { SubHeader } from "~/components/SubHeader";
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
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const linkAccount = () => {
    console.log(gbcEmail, gbcPass);
    if (gbcEmail && gbcPass) {
      gbcLinkMutation.mutate({
        email: gbcEmail,
        password: gbcPass,
      });
      //window.localStorage.setItem("gbc_access_token", gbcData.access_token);
    }
  };

  const gbcLinkMutation = api.gbcProxy.linkAccount.useMutation({
    onSuccess: (data) => {
      if (data?.access_token) {
        console.log(data.access_token);
        localStorage.setItem("x-jwt-auth-gbc", data.access_token);
      }
    },
  });
  const { data: gbcAccount } = api.gbcProxy.getForUser.useQuery();

  const [gbcEmail, setGbcEmail] = useState<string | undefined>();
  const [gbcPass, setGbcPass] = useState<string>();

  const readAccount = () => {
    console.log(gbcEmail, gbcPass);

    if (gbcEmail && gbcPass) {
      //gbcLinkMutation({ email: gbcEmail, password: gbcPass });
    }
  };

  if (sessionStatus === "unauthenticated") {
    void router.push("/");
  }

  return (
    <div>
      <SubHeader title="Gbc-link" />

      <div className="flex justify-center">
        <input
          type="checkbox"
          id="action-modal-gbc-link"
          className="modal-toggle"
        />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Confirm kick 🦵👋</h3>
            <p className="py-4">
              If you remove this player from this booking, he or she will have
              to re-join them selfes.
            </p>
            <div className="modal-action">
              <div className="btn-group">
                <label
                  htmlFor="action-modal-gbc-link"
                  className="btn text-white"
                >
                  Cancel
                </label>
                <label
                  htmlFor="action-modal-gbc-link"
                  className="btn-error btn text-white"
                  onClick={() => {
                    !!playerToRemove && removePlayer(playerToRemove);
                  }}
                >
                  Remove player
                </label>
              </div>
            </div>
          </div>
        </div>
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
              linkAccount();
            }}
            className="btn-success btn text-white"
          >
            Link my GBC-account
          </button>
          <button
            onClick={() => {
              readAccount();
            }}
            className="btn-success btn text-white"
          >
            Verify my GBC-account
          </button>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Gbc;
