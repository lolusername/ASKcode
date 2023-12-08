const { promisify } = require("util");
const { join, extname } = require("path");
const { readdir, readFile, stat } = require("fs");

const readDirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

// Recursively read all files in a directory and return a string containing the file contents
async function readCodeFiles(directory = "./") {
  let codeContent = "";
  // Files and extensions to ignore when reading the directory
  const ignoredFiles = [
    "node_modules",
    ".git",
    ".gitignore",
    "assets",
    ".vscode",
    ".firebase",
    "firebase.json",
    "package-lock.json",
    "dist",
    ".env",
    "public",
    "log.txt",
    ".DS_Store",
  ];
  const ignoredExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".bmp",
    ".tiff",
    ".svg", // Images
    ".mp3",
    ".wav",
    ".wma",
    ".ogg", // Audio
    ".mp4",
    ".avi",
    ".wmv",
    ".flv", // Video
    ".zip",
    ".rar",
    ".7z",
    ".tar",
    ".gz", // Archives
    ".pdf", // PDFs
    // Add any other file types you want to exclude
  ];

  // Read all files in the directory
  const files = await readDirAsync(directory);
  for (const file of files) {
    if (
      ignoredFiles.includes(file) ||
      ignoredExtensions.includes(extname(file).toLowerCase())
    ) {
      continue; // Skip ignored files and file types
    }
    const filePath = join(directory, file);
    const fileStat = await statAsync(filePath);

    console.log(filePath, fileStat.isDirectory());

    if (fileStat.isDirectory()) {
      // Recursively read files in subdirectory
      codeContent += await readCodeFiles(filePath);
    } else if (fileStat.isFile()) {
      const content = await readFileAsync(filePath, { encoding: "utf8" });
      codeContent = codeContent.replace(/\n{1,}/g, "\n"); // Note: This line should probably be outside the loop.
      codeContent += `\n### File name: ${filePath}\n${content}\n`;
    }
  }

  return codeContent;
}

module.exports = readCodeFiles;
