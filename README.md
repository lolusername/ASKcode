# ASKode


## Project Description

ASkode is a personal coding assistant that uses OpenAI's GPT-3 to provide answers to coding questions based on the codebase in your local directory. Simply send a POST request to the app's 'ask' route with a JSON body containing your question, and ASkode will generate an answer for you.

## Installation and Setup

To use this app, follow these steps:

1. Clone this repository to your local machine.
2. Navigate to the root directory of the project in your command line.
3. Run the command "npm install" to install the required dependencies.
4. Set the environment variable "API_KEY" to your OpenAI API key.
5. Set the path to your local directory containing the code files by passing it as a command line argument when launching the app: ` npm run start -- /path/to/your/code `


## Usage

To use this app, simply send a POST request to the "ask" route with a JSON body containing the question you want to ask, like so:
{ "question": "What is the purpose of this app?" }
The app will use GPT-3 to generate an answer to the question based on the code files in the specified directory.
