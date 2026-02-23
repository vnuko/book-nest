export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'rolled_back';
export type BatchItemStatus =
  | 'pending'
  | 'name_resolved'
  | 'images_fetched'
  | 'metadata_fetched'
  | 'completed'
  | 'failed';
export type FileType = 'book';

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  openLibraryKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  name: string;
  originalName: string | null;
  slug: string;
  authorId: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  originalTitle: string | null;
  slug: string;
  authorId: string;
  seriesId: string | null;
  seriesOrder: number | null;
  description: string | null;
  isbn: string | null;
  firstPublishYear: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  bookId: string | null;
  type: FileType;
  format: string;
  path: string;
  sha256: string | null;
  size: number | null;
  createdAt: string;
}

export interface IndexingBatch {
  id: string;
  status: BatchStatus;
  totalBooks: number;
  processedBooks: number;
  failedBooks: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface IndexingBatchItem {
  id: string;
  batchId: string;
  filePath: string;
  sourceSha256: string | null;
  status: BatchItemStatus;
  agentResults: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface CreateAuthorInput {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  openLibraryKey?: string | null;
}

export interface CreateSeriesInput {
  id: string;
  name: string;
  originalName?: string | null;
  slug: string;
  authorId: string;
  description?: string | null;
}

export interface CreateBookInput {
  id: string;
  title: string;
  originalTitle?: string | null;
  slug: string;
  authorId: string;
  seriesId?: string | null;
  seriesOrder?: number | null;
  description?: string | null;
  isbn?: string | null;
  firstPublishYear?: number | null;
}

export interface CreateFileInput {
  id: string;
  bookId?: string | null;
  type: FileType;
  format: string;
  path: string;
  sha256?: string | null;
  size?: number | null;
}

export interface CreateBatchInput {
  id: string;
  totalBooks: number;
}

export interface CreateBatchItemInput {
  id: string;
  batchId: string;
  filePath: string;
  sourceSha256?: string | null;
}
