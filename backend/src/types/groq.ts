export interface NameResolverInput {
  filePath: string;
}

export interface NameResolverAuthorOutput {
  name: string;
  confidence: number;
}

export interface NameResolverTitleOutput {
  original: string;
  english: string;
  confidence: number;
}

export interface NameResolverSeriesOutput {
  name: string | null;
  englishName: string | null;
  confidence: number;
}

export interface NameResolverItemOutput {
  filePath: string;
  confidence: number;
  author: NameResolverAuthorOutput;
  title: NameResolverTitleOutput;
  series: NameResolverSeriesOutput;
}

export interface MetadataResolverInput {
  authors: string[];
  books: Array<{ author: string; title: string }>;
  series: Array<{ author: string; name: string }>;
}

export interface MetadataAuthorOutput {
  name: string;
  bio: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  openLibraryKey: string | null;
}

export interface MetadataBookOutput {
  author: string;
  title: string;
  description: string | null;
  isbn: string | null;
  firstPublishYear: number | null;
}

export interface MetadataSeriesOutput {
  author: string;
  name: string;
  description: string | null;
}

export interface MetadataResolverOutput {
  authors: MetadataAuthorOutput[];
  books: MetadataBookOutput[];
  series: MetadataSeriesOutput[];
}

export interface GroqError {
  message: string;
  type: string;
  code: string;
}
