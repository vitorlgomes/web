"use client";

import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useMediaQuery } from "react-responsive";

import { Context } from "@/app/dashboard/Context";
import supabaseClient from "@/app/hooks/supabaseClient";
import LirioLogo from "@/assets/lirio-vector-logo.svg";
import { Button } from "@/components/ui/button";

import * as DashboardLayout from "../assets/dashboard-line.svg";
import * as Sales from "../assets/money-dollar-circle-line.svg";
import * as ShoppingBasket from "../assets/shopping-bag-black.svg";
import * as Categories from "../assets/stack-fill.svg";

export function Sidebar() {
  const router = useRouter();
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });
  const { isOpen } = React.useContext(Context);

  return (
    <>
      {isMobile && !isOpen ? (
        <></>
      ) : (
        <aside
          className={`z-10 flex h-screen w-60 flex-col justify-between bg-[##FCFBF7] p-4 font-nohemi font-normal ${isMobile && isOpen ? "absolute bg-white" : ""}`}
        >
          <div>
            <Image src={LirioLogo} alt="Lirio Logo" width={78} height={24} />
          </div>

          <nav className="mt-10 space-y-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-start space-x-2 text-center"
              >
                <Image
                  alt="Layout icon"
                  src={DashboardLayout}
                  className="h-5 w-5 text-[#BAAC7B]"
                />
                <span className="h-4 font-normal">Dashboard</span>
              </Button>
            </Link>
            <Link className="mt-2" href="/dashboard/orders">
              <Button
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-start space-x-2 text-left"
              >
                <Image
                  alt="Sales icon"
                  src={Sales}
                  className="h-5 w-5 text-[#BAAC7B]"
                />
                <span className="h-4 font-normal">Pedidos</span>
              </Button>
            </Link>
            <Link className="mt-2" href="/dashboard/products">
              <Button
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-start space-x-2 text-left"
              >
                <Image
                  alt="Basket icon"
                  src={ShoppingBasket}
                  className="h-5 w-5 text-[#BAAC7B]"
                />
                <span className="h-4 font-normal">Produtos</span>
              </Button>
            </Link>
            <Link className="mt-2" href="/dashboard/categories">
              <Button
                variant="ghost"
                size="sm"
                className="flex w-full items-center justify-start space-x-2 text-left"
              >
                <Image
                  alt="Categories icon"
                  src={Categories}
                  className="h-5 w-5 text-[#BAAC7B]"
                />
                <span className="h-4 font-normal">Categorias</span>
              </Button>
            </Link>
          </nav>

          <div className="mt-auto">
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-start space-x-2"
              onClick={async () => {
                const response = await supabaseClient?.auth.signOut();

                if (!response?.error) router.push("/auth");
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-normal">Logout</span>
            </Button>
          </div>
        </aside>
      )}
    </>
  );
}
