import type { NameResolverItemOutput, MetadataResolverOutput } from '../types/groq.js';

export function validateNameResolverOutput(output: NameResolverItemOutput): boolean {
  if (!output.filePath || typeof output.confidence !== 'number') return false;
  if (!output.author?.name || typeof output.author.confidence !== 'number') return false;
  if (!output.title?.original || typeof output.title.confidence !== 'number') return false;
  if (output.confidence < 0 || output.confidence > 1) return false;
  if (output.author.confidence < 0 || output.author.confidence > 1) return false;
  if (output.title.confidence < 0 || output.title.confidence > 1) return false;

  if (output.series) {
    if (typeof output.series.confidence !== 'number') return false;
    if (output.series.confidence < 0 || output.series.confidence > 1) return false;
  }

  return true;
}

export function validateMetadataResolverOutput(output: MetadataResolverOutput): boolean {
  if (
    !Array.isArray(output.authors) ||
    !Array.isArray(output.books) ||
    !Array.isArray(output.series)
  ) {
    return false;
  }

  for (const author of output.authors) {
    if (!author.name) return false;
  }

  for (const book of output.books) {
    if (!book.author || !book.title) return false;
  }

  for (const series of output.series) {
    if (!series.author || !series.name) return false;
  }

  return true;
}

export function normalizeNameResolverOutput(
  output: NameResolverItemOutput
): NameResolverItemOutput {
  return {
    filePath: output.filePath,
    confidence: Math.max(0, Math.min(1, output.confidence)),
    author: {
      name: output.author.name || 'Unknown Author',
      confidence: Math.max(0, Math.min(1, output.author.confidence)),
    },
    title: {
      original: output.title.original || output.filePath.split('/').pop() || 'Unknown Title',
      english: output.title.english || output.title.original || 'Unknown Title',
      confidence: Math.max(0, Math.min(1, output.title.confidence)),
    },
    series: output.series?.name
      ? {
          name: output.series.name,
          englishName: output.series.englishName || output.series.name,
          confidence: Math.max(0, Math.min(1, output.series.confidence)),
        }
      : {
          name: null,
          englishName: null,
          confidence: 0,
        },
  };
}
