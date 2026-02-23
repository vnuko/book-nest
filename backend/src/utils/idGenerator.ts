import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function generateAuthorId(): string {
  return generateId();
}

export function generateBookId(): string {
  return generateId();
}

export function generateSeriesId(): string {
  return generateId();
}

export function generateFileId(): string {
  return generateId();
}

export function generateBatchId(): string {
  const date = new Date().toISOString().split('T')[0];
  const uuid = uuidv4().substring(0, 8);
  return `batch-${date}-${uuid}`;
}

export function generateBatchItemId(): string {
  return generateId();
}
