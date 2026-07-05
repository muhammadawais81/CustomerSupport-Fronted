"use client";

import { useCallback, useEffect, useState } from "react";
import { getDocuments, deleteDocument, reprocessDocument } from "@/lib/api/documents";
import { ApiError } from "@/types/api";
import type { Document } from "@/types/documents";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { DocumentStatusBadge } from "@/components/ui/Badge";
import { formatDate, formatFileSize } from "@/lib/utils";
import { DocumentUpload } from "@/components/admin/DocumentUpload";

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchDocuments = useCallback(async () => {
    setError(null);
    try {
      const response = await getDocuments();
      setDocuments(response.data.documents);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load documents";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    setActionId(id);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to delete document";
      setError(message);
    } finally {
      setActionId(null);
    }
  };

  const handleReprocess = async (id: number) => {
    setActionId(id);
    try {
      const response = await reprocessDocument(id);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? response.data.document : doc)),
      );
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to reprocess document";
      setError(message);
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocumentUpload onUploadComplete={fetchDocuments} />

      {error && <Alert variant="error">{error}</Alert>}

      {documents.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-dashed border-white/15 py-16 text-center">
          <p className="text-sm font-medium text-slate-300">No documents yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Upload your first document to get started.
          </p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {documents.map((doc) => (
                  <tr key={doc.id} className="ai-table-row transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-200">
                      {doc.original_filename}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm uppercase text-slate-500">
                      {doc.file_type}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <DocumentStatusBadge status={doc.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {(doc.status === "FAILED" || doc.status === "COMPLETED") && (
                          <Button
                            variant="glass"
                            size="sm"
                            isLoading={actionId === doc.id}
                            onClick={() => handleReprocess(doc.id)}
                          >
                            Reprocess
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={actionId === doc.id}
                          onClick={() => handleDelete(doc.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
