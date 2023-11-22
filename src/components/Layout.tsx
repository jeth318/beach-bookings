import React, { type ReactNode } from "react";
import { Header } from "./Header";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  return (
    <div className="layout text-black dark:text-white">
      <Header />
      {children}
    </div>
  );
};
