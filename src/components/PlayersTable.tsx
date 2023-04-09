import { type User } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Props = {
  players: User[];
};

export const PlayersTable = ({ players }: Props) => {
  return (
    <div className="">
      <table className="table-compact table w-full">
        {/* head */}
        <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            return (
              <tr key={player.id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <Image
                          height={100}
                          width={100}
                          alt="user-icon-default"
                          src={player.image || "/user-default.png"}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{player.name}</div>
                      <div className="text-sm opacity-50">{player.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <button className="btn-outline btn-sm btn">Remove</button>
                </td>
              </tr>
            );
          })}
        </tbody>
        {/* foot */}
        <tfoot>
          <tr>
            <th></th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
