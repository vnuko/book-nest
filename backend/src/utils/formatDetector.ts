import path from 'path';

export const SUPPORTED_FORMATS = ['epub', 'mobi', 'txt', 'pdf', 'azw', 'azw3', 'pdb'] as const;
export type EbookFormat = (typeof SUPPORTED_FORMATS)[number];

export function detectFormat(filePath: string): EbookFormat | null {
  const ext = path.extname(filePath).toLowerCase().slice(1);

  if (SUPPORTED_FORMATS.includes(ext as EbookFormat)) {
    return ext as EbookFormat;
  }

  return null;
}

export function isEbookFile(filePath: string): boolean {
  return detectFormat(filePath) !== null;
}

export function getConversionTargets(sourceFormat: EbookFormat): EbookFormat[] {
  const allFormats = [...SUPPORTED_FORMATS];
  return allFormats.filter((format) => format !== sourceFormat);
}
