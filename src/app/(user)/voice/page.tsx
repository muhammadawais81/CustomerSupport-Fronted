import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import VoicePageClient from "./VoicePageClient";

export default function VoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <VoicePageClient />
    </Suspense>
  );
}
