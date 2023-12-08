document.addEventListener("DOMContentLoaded", () => {
  // comment
  setupEventListeners();
  handleSelectRepo();
  fetchCurrentRepo();
});

function toggleMenuVisibility() {
  const menu = getElement("menu");
  menu.classList.toggle("hidden");
}

function closeMenuIfClickedOutside(event) {
  const dropdownWrapper = getElement("dropdown-wrapper");
  if (!dropdownWrapper.contains(event.target)) {
    const menu = getElement("menu");
    menu.classList.add("hidden");
  }
}

function getElement(id) {
  return document.getElementById(id);
}

async function handleQuerySubmission() {
  const questionInput = getElement("questionInput");
  const answerResults = getElement("answerResults");
  const loadingSpinner = getElement("loading-response");
  const question = questionInput.value || questionInput.placeholder;

  answerResults.innerHTML = "";
  loadingSpinner.classList.remove("hidden");
  try {
    const { data } = await axios.post(`/ask`, { question });
    answerResults.innerHTML = formatResponse(data);
  } catch (error) {
    console.error(error);
    alert("An error occurred while fetching the answer.");
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

async function handleCloneRepo(repoUrl) {
  const currentRepoSpan = getElement("current-repo");
  currentRepoSpan.innerText = "";
  const loadingSpinner = getElement("loading-repo");
  loadingSpinner.classList.remove("hidden");
  try {
    await axios.post(`/clone-repo`, { repoUrl });
    await fetchCurrentRepo();
    toggleMenuVisibility();
  } catch (error) {
    alert("An error occurred while downloading the repo");
  }
  loadingSpinner.classList.add("hidden");
}

function handleSelectRepo() {
  document.querySelectorAll(".repo-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const repoUrl = event.currentTarget.getAttribute("data-url");
      handleCloneRepo(repoUrl);
    });
  });
}

function formatResponse({ answer }) {
  const formatBoldText = (text) =>
    text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  return answer
    .split("```")
    .map((text, index) => {
      // Apply bold formatting to both code and non-code text
      const formattedText = formatBoldText(text);
      return index % 2 === 0
        ? `<span>${formattedText}</span>`
        : `<pre>${formattedText.trim()}</pre>`;
    })
    .join("");
}

async function fetchCurrentRepo() {
  try {
    const response = await axios.get(`/get-current-repo`);
    const currentRepoSpan = getElement("current-repo");
    currentRepoSpan.innerText = response.data.repoName;
  } catch (error) {
    console.error("Could not fetch current repo:", error);
  }
}

function setupEventListeners() {
  getElement("menuToggle").addEventListener("click", toggleMenuVisibility);
  window.addEventListener("click", closeMenuIfClickedOutside);
  getElement("askButton").addEventListener("click", handleQuerySubmission);
}
