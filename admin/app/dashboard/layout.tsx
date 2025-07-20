"use client";

import { Sidebar } from "@/components/Sidebar";
import React, { SetStateAction, Dispatch } from "react";

type State = {
  isOpen: boolean;
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
};

export const Context = React.createContext<State>({
  isOpen: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Context.Provider value={{ isOpen: isOpen, setIsOpen }}>
      <div className="flex h-screen gap-6 bg-[#FCFBF7]">
        <Sidebar />
        <main className="m-2 flex w-full flex-col gap-6 overflow-y-auto rounded-lg border border-[#DAE5DA] bg-white p-8 md:m-4 lg:m-8">
          {children}
        </main>
      </div>
    </Context.Provider>
  );
}
