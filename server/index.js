const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const readCodeFiles = require("./readCodeFiles");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const util = require("util");
const app = express();
// const functions = require("firebase-functions");
const exp = require("constants");
const port = process.env.PORT || 8800;
const openai_api_key = process.env.OPENAI_API_KEY;
const CODE_DIRECTORY = process.argv[2] || "./repo";

if (!openai_api_key) {
  console.error("no openai environment variable.");
  process.exit(1);
}

app.use(express.json());
app.use("/", express.static("public"));

const configuration = new Configuration({ apiKey: openai_api_key });
const openai = new OpenAIApi(configuration);
const MODEL = "gpt-4-1106-preview";

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "A question is required." });
  }
  try {
    const codeContent = await readCodeFiles(CODE_DIRECTORY);
    const answer = await getAnswerFromGPT(codeContent, question, openai);
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

const deleteFolderRecursive = util.promisify((directoryPath, callback) => {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
  callback(null);
});

app.post("/clone-repo", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: "A repository URL is required." });
  }

  try {
    // Clear the 'repo' directory first
    await deleteFolderRecursive("./repo");
    // Then recreate the directory
    fs.mkdirSync("./repo");

    const message = await cloneRepository(repoUrl, "./repo");
    res.json({ message });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while cloning the repository." });
  }
});

app.get("/get-current-repo", async (_req, res) => {
  try {
    const files = fs.readdirSync("./repo");
    const directories = files.filter((file) =>
      fs.statSync(`./repo/${file}`).isDirectory()
    );

    if (directories.length === 0) {
      return res
        .status(404)
        .json({ error: "No repositories found in the 'repo' directory." });
    } else if (directories.length > 1) {
      return res.status(400).json({
        error: "There is more than one repository in the 'repo' directory.",
      });
    }

    const repoName = directories[0];
    res.json({ repoName });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function getAnswerFromGPT(codeContent, question, openai) {
  const prompt = `this is my current codebase, i will ask questions about it:${codeContent}\nQuestion:${question}\nAnswer:`;
  const response = await openai.createChatCompletion({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a personal coding assistant. You have full access to the current codebase and will help the user with software development",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.9,
  });
  return response.data.choices[0].message.content;
}

async function cloneRepository(repoUrl, directory) {
  const repoName = path.basename(repoUrl, ".git");
  const repoPath = path.join(directory, repoName);
  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
  return new Promise((resolve, reject) => {
    exec(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else {
        resolve("Repository successfully cloned.");
      }
    });
  });
}

module.exports = app; // Export app for testing purposes
