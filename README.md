# DOAP - Data Oriented Agentic Planning

DOAP is a high-performance, local-first Desktop Application built with Electron. It combines advanced web scraping capabilities with local LLM orchestration and a futuristic interactive architecture visualization.

![Architecture Hub](https://raw.githubusercontent.com/ForceGraph/force-graph/master/example/img/screenshot.png) <!-- Note: Replace with actual screenshot if available -->

## 🚀 Key Features

- **Advanced Web Scraper**: Native Node.js scraping engine with markdown conversion for AI-ready data.
- **Local AI Hub (Ollama)**: Full integration with local Ollama instances. Monitor running models, pull new ones, and manage your inventory directly from the app.
- **Interactive Architecture Map**: A high-tech, force-directed graph that visualizes system dependencies and data flow in real-time.
- **SQLite Data Persistence**: All crawled data and insights are stored locally in a structured SQLite database.
- **Integrated WSL Terminal**: Run low-level commands and manage your local environment without leaving the application.
- **Premium Glassmorphism UI**: A sleek, dark-themed interface designed for professional-grade productivity.

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, TypeScript (Web Components)
- **Backend**: Electron.js, Node.js, TypeScript (ESM)
- **Database**: SQLite3
- **Visualization**: Force-Graph.js (Canvas-based)
- **AI Integration**: Ollama API

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **WSL2** (Optional): For integrated terminal operations and local Linux-based AI workflows.
- **Ollama**: Installed and running locally for AI features.

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/DOAP.git
   cd DOAP
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile TypeScript**:
   ```bash
   npm run compile
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

## 🛠 Development Commands

- `npm run compile`: Compiles TypeScript files to the `dist-ts` folder.
- `npm run dev`: Compiles and then starts the Electron application.
- `npm run build`: Compiles and builds the production installer using electron-builder.

## 🔒 Privacy & Security

DOAP is designed with privacy in mind:
- **Local Data Only**: Your scraped content and AI prompts never leave your machine.
- **No Personal Data Exposure**: The database is stored in your system's `userData` folder, separate from the source code.
- **GitHub Ready**: Robust `.gitignore` prevents accidental leaks of OS files, logs, or sensitive configs.

## 🗺 Interactive Map
Navigating DOAP is as simple as clicking a node on the **Architecture Map**. Explore the relationships between the Scraper, AI Hub, and Database through a dynamic, mission-control-style interface.

---
*Built for developers who value performance, privacy, and premium design.*
