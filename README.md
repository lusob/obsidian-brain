# 🧠 Obsidian brAIn plugin

This plugin enables a ChatGPT powered chatbot specifically focused on question answering over your Obsidian vault notes(markdown files).

### 🧰 Requirements

- [Docker](https://docs.docker.com/get-docker/)

### 📖 How to use

1. Install the plugin in your Obsidian vault by going to `Settings -> Community Plugins -> Browse` and searching for `brAIn`.
2. After installation, In the settings section of the plugin, enter your OpenAI API key to enable the plugin to ingest your vault documents and to use the chat.
3. Feed the model with your notes your vault notes running `brAIn: Ingest vault docs` command in the command palette or by pressing `Ctrl/Cmd + P`.
4. From now on you can also talk with your brAIn by clicking on the brain button in the ribbon or running `brAIn: Open chat` command in the command palette or by pressing `Ctrl/Cmd + P`.

*If you have new notes that you want to be indexed by the brAIn just run again `brAIn: Ingest vault docs`*

### 🛠 How it works

The plugin uses a Docker container running the brAIn server to enable the chatbot functionality. The brAIn server reads in your Obsidian vault documents and uses the OpenAI GPT-3 API to enable the question answering functionality. Once the server is running, you can chat with the bot through the plugin's interface.

### 💬 Support

If you have any issues or feature requests, please open an issue on [GitHub](https://github.com/).

### 📓 License

This plugin is licensed under the [MIT License](https://github.com/lusob/obsidian-brain/blob/main/LICENSE).

### ⚠️ Limitations

During the ingestion (embedding generation) a big amount of notes in your vault can lead to high expenses (~ 1000 notes = 1$), monitor your account and set API key limits to avoid scares

### 🐞 Known Issues

brAIn may occasionally generate incorrect or irrelevant content based on the user's input. Additionally, it may encounter errors when calling the OpenAI API if the API key is invalid or if there are issues with the OpenAI API service.
