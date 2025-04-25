import fs from "fs/promises";
import path from "path";

/**
 * Checks if a file contains specific content.
 * This is useful for verifying that changes to a file were synced correctly.
 *
 * @param filePath The path to the file to check
 * @param expectedContent The content to check for
 * @returns A promise that resolves to true if the file contains the expected content, false otherwise
 */
export const fileContains = async (
  filePath: string,
  expectedContent: string
): Promise<boolean> => {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content.includes(expectedContent);
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error);
    return false;
  }
};

/**
 * Recursively checks if all files from a source directory exist in a destination directory
 * with the same relative paths and identical content.
 *
 * @param sourceDir The source directory path
 * @param destDir The destination directory path
 * @returns A promise that resolves to true if all files exist and match, false otherwise
 */
export const filesExist = async (
  sourceDir: string,
  destDir: string
): Promise<boolean> => {
  try {
    const files = await getFilesRecursively(sourceDir);

    const checks = await Promise.all(
      files.map(async (file) => {
        const relativePath = path.relative(sourceDir, file);
        const destPath = path.join(destDir, relativePath);

        try {
          await fs.access(destPath);
          const [sourceContent, destContent] = await Promise.all([
            fs.readFile(file),
            fs.readFile(destPath),
          ]);
          return sourceContent.equals(destContent);
        } catch {
          return false;
        }
      })
    );

    return checks.every(Boolean);
  } catch {
    return false;
  }
};

/**
 * Recursively checks if all files from a source directory do NOT exist in a destination directory.
 * This is useful for verifying that files have been completely removed.
 *
 * @param sourceDir The source directory path
 * @param destDir The destination directory path
 * @returns A promise that resolves to true if all files do NOT exist, false if any file exists
 */
export const filesDoNotExist = async (
  sourceDir: string,
  destDir: string
): Promise<boolean> => {
  try {
    const files = await getFilesRecursively(sourceDir);

    const checks = await Promise.all(
      files.map(async (file) => {
        const relativePath = path.relative(sourceDir, file);
        const destPath = path.join(destDir, relativePath);

        try {
          await fs.access(destPath);
          // File exists, which means it wasn't removed
          return false;
        } catch {
          // File doesn't exist, which is what we want
          return true;
        }
      })
    );

    // Return true only if ALL files do NOT exist
    return checks.every(Boolean);
  } catch {
    return false;
  }
};

/**
 * Recursively gets all file paths in a directory
 *
 * @param dir The directory path
 * @returns A promise that resolves to an array of file paths
 */
const getFilesRecursively = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getFilesRecursively(fullPath);
      }

      return fullPath;
    })
  );

  return files.flat();
};
