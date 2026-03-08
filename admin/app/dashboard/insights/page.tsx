"use client";

import withAuth from "@/app/hooks/withAuth";
import ChatInterface from "@/components/ChatInterface";

import { SessionProps } from "../layout";

function InsightsPage(props: SessionProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <header>
        <h1 className="font-nohemi text-2xl font-medium">Insights</h1>
      </header>

      {/* Chat Container */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#DAE5DA]/60 bg-white shadow-sm shadow-black/[0.02]">
        {/*In progress..*/}
        <ChatInterface shopId={props.shopId} />
      </div>
    </div>
  );
}

export default withAuth(InsightsPage);
