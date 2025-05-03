import { Card } from "./ui/card";
import Image from "next/image";
import * as ShoppingBasket from "../assets/shopping-bag.svg";
import * as OrderIcon from "../assets/orders.svg";
import * as InstitutionalIcon from "../assets/institutional.svg";
import * as TimeIcon from "../assets/time.svg";

type Props = {
  title: string;
  value?: number | string;
  icon?: "shopping-basket" | "institutional" | "order" | "time";
  type: "int" | "currency" | "text";
  live?: boolean; // New prop to indicate live status
};

export default function DashboardCard(props: Props) {
  if (props.value === undefined && !props.title) {
    return;
  }

  const iconMap = {
    "shopping-basket": ShoppingBasket,
    institutional: InstitutionalIcon,
    order: OrderIcon,
    time: TimeIcon,
  };

  return (
    <Card className="relative flex flex-1 flex-col items-start justify-between self-stretch bg-[#FAF9F6] px-6 py-8">
      {/* Live Badge */}
      {props.live && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#005930] px-3 py-1 font-nohemi text-xs font-bold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
          Ao vivo
        </div>
      )}

      <div className="mb-6 flex flex-col items-center justify-center gap-1.5 rounded-full bg-[#FFF0E5] p-2.5">
        <Image
          alt="Basket icon"
          src={iconMap[props.icon || "shopping-basket"]}
          className="h-5 w-5 text-[#BAAC7B]"
        />
      </div>

      <div className="flex w-[12rem] items-end justify-between">
        <div className="flex flex-col items-start gap-[var(--sds-size-space-200)]">
          <div className="font-nohemi text-2xl font-medium leading-normal text-[#0B0C0B]">
            {props.type === "currency"
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format((props.value as number) || 0)
              : props.value}
          </div>
          <div
            style={{
              inlineSize: "150px",
            }}
            className="wrap-break-word w-full font-inter text-sm font-medium leading-normal text-[#6D736D]"
          >
            {props.title}
          </div>
        </div>
      </div>
    </Card>
  );
}
