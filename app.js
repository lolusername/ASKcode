const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

require("dotenv").config();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

console.log(process.argv);
const app = express();

const port = 5000;

// Set your OpenAI API key
const api_key = process.env.API_KEY;

// Set the path to your local directory containing the code files

let CODE_DIRECTORY;
if (process.argv[2]) {
  CODE_DIRECTORY = process.argv[2];
} else {
  CODE_DIRECTORY = "./";
}

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

app.use("/", express.static("public"));

app.post("/ask", async (req, res) => {
  const question = req.body.question;
  if (!question) {
    return res.status(400).json({ error: "A question is required." });
  }

  const codeContent = await readCodeFiles();

  const response = await askGPT3Question(codeContent, question);
  res.json({ answer: response });
});

const configuration = new Configuration({
  apiKey: api_key,
});
const openai = new OpenAIApi(configuration);

async function askGPT3Question(codeContent, question) {
  const prompt = `this is my  current codebase, i will ask questions about it:${codeContent}\n Question:${question}\nAnswer:`;

  // Log prompt to a file for debugging, uncomment to use
  // fs.writeFile("log.txt", prompt + "\n", function (err) {
  //   if (err) throw err;
  //   console.log("Prompt logged to file!");
  // });

  // Create a completion request to GPT-3 with the prompt
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are surprisingly helpful personal coding assistant, you have full access to the current codebase and will help the user with software development, prioritize referecing the codebase when answering prompts",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
    n: 1,
    stop: null,
    temperature: 0.9,
  });
  console.log(response.data.choices[0].message.content);
  const answer = response.data.choices[0].message.content;

  return answer;
}

// Recursively read all files in a directory and return a string containing the file contents
async function readCodeFiles(directory = CODE_DIRECTORY) {
  let codeContent = "";
  const { promisify } = require("util");
  const { join } = require("path");
  const { readdir, readFile, stat } = require("fs");
  const readDirAsync = promisify(readdir);
  const readFileAsync = promisify(readFile);
  const statAsync = promisify(stat);

  // Files to ignore when reading the directory
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

  // Read all files in the directory
  const files = await readDirAsync(directory);
  for (const file of files.filter((file) => !ignoredFiles.includes(file))) {
    const filePath = join(directory, file);
    const fileStat = await statAsync(filePath);

    console.log(filePath, fileStat.isDirectory());

    codeContent = codeContent.replace(/\n{1,}/g, "\n");
    if (fileStat.isDirectory()) {
      // Recursively read files in subdirectory
      codeContent += await readCodeFiles(filePath);
    } else if (fileStat.isFile()) {
      const content = await readFileAsync(filePath, { encoding: "utf8" });
      codeContent += `\n### file name: ${filePath}  ${content}\n`;
    }
  }
  return codeContent;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
