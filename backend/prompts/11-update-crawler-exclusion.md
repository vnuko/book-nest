# Prompt 11: Update Crawler to Exclude Processed Folder

## GitHub Issue
[#13 - Batch processing refactoring](https://github.com/vnuko/book-nest/issues/13)

## Objective
Update the file crawler to exclude the `processed` folder from file discovery. This prevents re-indexing of already processed files.

---

## File: `src/indexer/crawler.ts`

### Current `discoverFiles()` Method (lines 31-59):
```typescript
async discoverFiles(): Promise<DiscoveredFile[]> {
  logger.info('Starting file discovery', { sourcePath: this.sourcePath });

  const pattern = path.join(this.sourcePath, '**', '*.*').replace(/\\/g, '/');
  const files = await glob(pattern, { nodir: true });

  const discovered: DiscoveredFile[] = [];

  for (const filePath of files) {
    const format = detectFormat(filePath);

    if (!format) {
      continue;
    }

    try {
      const stats = await fs.stat(filePath);
      discovered.push({
        path: filePath,
        format,
        size: stats.size,
      });
    } catch (error) {
      logger.warn('Failed to stat file', { filePath, error: (error as Error).message });
    }
  }

  logger.info('File discovery complete', { count: discovered.length });
  return discovered;
}
```

### Change Required:
Add `ignore` option to glob to exclude the processed folder.

### New Code:
```typescript
async discoverFiles(): Promise<DiscoveredFile[]> {
  logger.info('Starting file discovery', { sourcePath: this.sourcePath });

  const pattern = path.join(this.sourcePath, '**', '*.*').replace(/\\/g, '/');
  const processedPath = path.join(this.sourcePath, 'processed').replace(/\\/g, '/');
  
  const files = await glob(pattern, { 
    nodir: true,
    ignore: [`${processedPath}/**`]
  });

  const discovered: DiscoveredFile[] = [];

  for (const filePath of files) {
    const format = detectFormat(filePath);

    if (!format) {
      continue;
    }

    try {
      const stats = await fs.stat(filePath);
      discovered.push({
        path: filePath,
        format,
        size: stats.size,
      });
    } catch (error) {
      logger.warn('Failed to stat file', { filePath, error: (error as Error).message });
    }
  }

  logger.info('File discovery complete', { count: discovered.length, processedPathExcluded: processedPath });
  return discovered;
}
```

### Explanation:
1. Build the processed path: `source/processed`
2. Add `ignore` option to glob pattern with `**` wildcard
3. Log that processed path is excluded for debugging
4. The glob package's `ignore` option accepts an array of patterns to exclude

### Example:
- Source path: `./source`
- Pattern: `./source/**/*.*`
- Ignore: `./source/processed/**`
- Result: All files in `./source` EXCEPT those in `./source/processed/` folder

---

## Verification
After applying changes:
1. Run `npm run build` - should compile without errors
2. Create a test file in `source/processed/` folder
3. Call crawler - it should NOT include files from processed folder
4. Check logs for `processedPathExcluded` confirmation

---

## Dependencies
- Requires Prompt 10 to be executed first (config.paths.processed must exist, though not directly used in this prompt)

