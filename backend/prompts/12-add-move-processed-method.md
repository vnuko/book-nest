# Prompt 12: Add Move to Processed Method in FileOrganizer

## GitHub Issue
[#13 - Batch processing refactoring](https://github.com/vnuko/book-nest/issues/13)

## Objective
Add a method to `FileOrganizer` class that moves successfully processed source files to the processed folder while preserving the original folder structure.

---

## File: `src/indexer/fileOrganizer.ts`

### Location
Add new interface and methods after the existing `removeAuthor()` method (around line 213).

---

### 1. Add New Interface (after line 22, after existing interfaces):

```typescript
export interface MoveProcessedResult {
  originalPath: string;
  newPath: string;
  success: boolean;
  error?: string;
}
```

---

### 2. Add New Methods (after `removeAuthor()` method, before the export):

Add these three methods to the `FileOrganizer` class:

```typescript
async moveProcessedFile(
  sourceFilePath: string,
  sourceBaseDir: string,
  processedDir: string
): Promise<MoveProcessedResult> {
  try {
    const normalizedSource = path.resolve(sourceFilePath);
    const normalizedBase = path.resolve(sourceBaseDir);
    const normalizedProcessed = path.resolve(processedDir);

    const relativePath = path.relative(normalizedBase, normalizedSource);
    
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return {
        originalPath: sourceFilePath,
        newPath: '',
        success: false,
        error: 'File is outside source directory',
      };
    }

    const targetPath = path.join(normalizedProcessed, relativePath);
    await fs.ensureDir(path.dirname(targetPath));
    await fs.move(normalizedSource, targetPath, { overwrite: false });

    logger.info('File moved to processed', {
      source: sourceFilePath,
      target: targetPath,
    });

    return {
      originalPath: sourceFilePath,
      newPath: targetPath,
      success: true,
    };
  } catch (error) {
    const errorMessage = (error as Error).message;
    logger.error('Failed to move file to processed', error as Error, {
      source: sourceFilePath,
    });

    return {
      originalPath: sourceFilePath,
      newPath: '',
      success: false,
      error: errorMessage,
    };
  }
}

async moveProcessedFiles(
  filePaths: string[],
  sourceBaseDir: string,
  processedDir: string
): Promise<MoveProcessedResult[]> {
  const results: MoveProcessedResult[] = [];

  for (const filePath of filePaths) {
    const result = await this.moveProcessedFile(filePath, sourceBaseDir, processedDir);
    results.push(result);
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  logger.info('Batch file move completed', {
    total: filePaths.length,
    successful,
    failed,
  });

  return results;
}
```

---

### Explanation:

**`moveProcessedFile()` method:**
- Takes source file path, source base directory, and processed directory
- Calculates relative path from source base to preserve folder structure
- Validates file is inside source directory (security check)
- Moves file using `fs.move()` with `overwrite: false`
- Returns `MoveProcessedResult` with success status

**Example:**
- Input: `moveProcessedFile('./source/Stephen King/Book.epub', './source', './source/processed')`
- Output: File moved to `./source/processed/Stephen King/Book.epub`

---

## Verification
After applying changes:
1. Run `npm run build` - should compile without errors
2. The methods `moveProcessedFile()` and `moveProcessedFiles()` should be available on `fileOrganizer` instance

---

## Dependencies
- Requires Prompt 10 to be executed first (config.paths.processed must exist)
- This prompt should be executed after Prompt 11 (crawler exclusion)
