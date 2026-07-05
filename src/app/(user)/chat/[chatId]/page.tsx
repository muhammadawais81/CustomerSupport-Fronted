"use client";

import { use } from "react";
import { ChatInterface } from "@/components/user/chat/ChatInterface";

export default function ChatDetailPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  const id = Number(chatId);

  if (Number.isNaN(id)) {
    return null;
  }

  return <ChatInterface chatId={id} />;
}
