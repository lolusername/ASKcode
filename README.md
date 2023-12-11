# ASKCODE: GITHUB REPOSITORY ADVISOR

## Description
This project is a demo showcasing interesting use cases for the GPT-4 model from OpenAI. It provides an API for querying specific questions related to a codebase and receiving intelligent responses.

## Getting Started
To get started with this project, you will need to clone the repository and set up the necessary environment variables.

### Prerequisites
- Node.js
- npm or yarn
- OpenAI API key

### Installation
1. Clone the repository:
sh git clone
2. Install dependencies:
sh npm install
3. Set up environment variables:
   Create a `.env` file in the root directory and add your OpenAI API key:
OPENAI_API_KEY=your_api_key_here
## Usage
- Use the provided API endpoints to interact with the GPT-4 model and get intelligent answers to your code-related questions.
- The project also includes a development script for live-updating the CSS using TailwindCSS.

## API Endpoints
- `POST /ask` - Send a code-related question and receive an intelligent answer.
- `POST /clone-repo` - Clone a repository into the project's directory for querying.
- `GET /get-current-repo` - Retrieve the name of the currently cloned repository.

## Built With
- Node.js
- Express.js
- OpenAI API
- TailwindCSS
- Other dependencies listed in `package.json`

## License
This project is licensed under the ISC License.
