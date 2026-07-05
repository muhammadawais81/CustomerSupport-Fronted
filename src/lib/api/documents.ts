import { apiClient } from "@/lib/api/client";
import type {
  DeleteDocumentResponse,
  DocumentResponse,
  DocumentsListResponse,
  UploadDocumentsResponse,
} from "@/types/documents";

export async function uploadDocuments(files: File[]): Promise<UploadDocumentsResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return apiClient<UploadDocumentsResponse>("/api/admin/documents/upload", {
    method: "POST",
    auth: true,
    formData,
  });
}

export async function getDocuments(): Promise<DocumentsListResponse> {
  return apiClient<DocumentsListResponse>("/api/admin/documents", {
    method: "GET",
    auth: true,
  });
}

export async function getDocument(documentId: number): Promise<DocumentResponse> {
  return apiClient<DocumentResponse>(`/api/admin/documents/${documentId}`, {
    method: "GET",
    auth: true,
  });
}

export async function deleteDocument(documentId: number): Promise<DeleteDocumentResponse> {
  return apiClient<DeleteDocumentResponse>(`/api/admin/documents/${documentId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function reprocessDocument(documentId: number): Promise<DocumentResponse> {
  return apiClient<DocumentResponse>(
    `/api/admin/documents/${documentId}/reprocess`,
    {
      method: "POST",
      auth: true,
    },
  );
}
