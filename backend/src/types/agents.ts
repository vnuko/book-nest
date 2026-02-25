import type { EbookFormat } from '../utils/formatDetector.js';

export interface AgentInputFile {
  id: string;
  path: string;
  format: EbookFormat;
  sha256: string;
}

export interface NameResolverAgentInput {
  batchId: string;
  files: AgentInputFile[];
}

export interface ResolvedAuthor {
  originalName: string;
  normalizedName: string;
  slug: string;
  confidence: number;
}

export interface ResolvedTitle {
  originalTitle: string;
  englishTitle: string;
  slug: string;
  confidence: number;
}

export interface ResolvedSeries {
  originalName: string | null;
  englishName: string | null;
  slug: string | null;
  confidence: number;
}

export interface NameResolverAgentResult {
  fileId: string;
  filePath: string;
  sha256: string;
  format: EbookFormat;
  author: ResolvedAuthor;
  title: ResolvedTitle;
  series: ResolvedSeries;
  overallConfidence: number;
}

export interface ImageResolverAgentInput {
  batchId: string;
  authors: Array<{
    name: string;
    slug: string;
  }>;
  books: Array<{
    title: string;
    authorName: string;
    authorSlug: string;
    bookSlug: string;
  }>;
}

export interface ImageResolverAgentResult {
  authors: Map<string, { imageUrl: string | null; confidence: number }>;
  books: Map<string, { imageUrl: string | null; confidence: number }>;
}

export interface MetadataResolverAgentInput {
  batchId: string;
  authors: Array<{
    name: string;
    slug: string;
  }>;
  books: Array<{
    title: string;
    englishTitle: string;
    authorName: string;
    authorSlug: string;
    bookSlug: string;
  }>;
  series: Array<{
    name: string;
    englishName: string;
    authorName: string;
    authorSlug: string;
  }>;
}

export interface AuthorMetadata {
  name: string;
  slug: string;
  bio: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  openLibraryKey: string | null;
}

export interface BookMetadata {
  title: string;
  authorName: string;
  authorSlug: string;
  bookSlug: string;
  description: string | null;
  firstPublishYear: number | null;
}

export interface SeriesMetadata {
  name: string;
  englishName: string;
  authorName: string;
  authorSlug: string;
  description: string | null;
}

export interface MetadataResolverAgentResult {
  authors: Map<string, AuthorMetadata>;
  books: Map<string, BookMetadata>;
  series: Map<string, SeriesMetadata>;
}

export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';
