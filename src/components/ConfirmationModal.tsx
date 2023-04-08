import { type Booking } from "@prisma/client";
import { signIn, signOut, useSession } from "next-auth/react";


export const ConfirmationModal = ({}) => {
  return (
    <div>
      {/* Put this part before </body> tag */}
      <input type="checkbox" id="action-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            Congratulations random Internet user!
          </h3>
          <p className="py-4">
            You've been selected for a chance to get one year of subscription to
            use Wikipedia for free!
          </p>
          <div className="modal-action">
            <label htmlFor="action-modal" className="btn">
              Yay!
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
