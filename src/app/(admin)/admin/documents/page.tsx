import { DocumentList } from "@/components/admin/DocumentList";
import { AIOrb } from "@/components/ui/AIOrb";

export default function AdminDocumentsPage() {
  return (
    <div className="page-enter space-y-6">
      <div className="flex items-start gap-4">
        <AIOrb size="md" className="shrink-0 mt-1" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Upload and manage documents that power your AI support agent.
          </p>
        </div>
      </div>

      <DocumentList />
    </div>
  );
}
