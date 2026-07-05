export type DocumentStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface Document {
  id: number;
  company_id: number;
  original_filename: string;
  stored_filename: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  status: DocumentStatus;
  created_at: string;
  updated_at: string | null;
}

export interface UploadedDocument {
  id: number;
  filename: string;
  status: DocumentStatus;
}

export interface DocumentsListResponse {
  success: boolean;
  message: string;
  data: {
    documents: Document[];
  };
}

export interface DocumentResponse {
  success: boolean;
  message: string;
  data: {
    document: Document;
  };
}

export interface UploadDocumentsResponse {
  success: boolean;
  message: string;
  data: {
    documents: UploadedDocument[];
  };
}

export interface DeleteDocumentResponse {
  success: boolean;
  message: string;
}
