# DOAP - Future Plan & Roadmap

This document serves as a living record of DOAP's current features, ongoing development, and future aspirations. It is aligned with the **Capability Architecture Map** found in the application.

## 📊 Project Overview

**DOAP (Data Oriented Agentic Planning)** is a high-performance, local-first Desktop Application built with Electron that combines advanced web scraping capabilities with local LLM orchestration and a layered interactive architecture visualization.

## ✅ Current Features (Built)

The following components are fully functional and integrated into the core system:

### Presentation Layer
- **Home (`home`)**: Central hub with search, quick-links, and live Ollama status monitoring.
- **Browser (`browser`)**: Embedded Chromium browser for previewing and scraping target websites.
- **Curiosity (`curiosity`)**: RAG-powered AI assistant that queries scraped data with context-aware prompts.

### Application Layer
- **Web Scraper (`scraper`)**: Native Node.js engine (Cheerio/JSDOM) for high-performance extraction and Markdown conversion.
- **History (`history`)**: Browsable log of all scrape sessions with metadata, timestamps, and previews.
- **Multi-LLM (`multi-llm`)**: Orchestrates multiple Ollama models for parallel inference and comparison.

### Infrastructure Layer
- **SQLite DB (`sqlite`)**: Local relational database storing scraped content, metadata, and session history.
- **Ollama Hub (`ollama`)**: Model management hub — pull, run, and monitor local LLM instances on device.
- **WSL Terminal (`wsl`)**: Integrated Linux shell via WSL (node-pty/xterm) for direct system access.

## 🚀 Roadmap: Future Features (Planned)

The following features are visualized as "Roadmap" blocks in the Architecture Map and are slated for upcoming releases.

### 🟡 Short-term (Next Release)
- **Dashboard Widgets (`dashboard-widgets`)**: [Presentation] Customizable dashboard with user-defined quick links.
- **Data Export (`data-export`)**: [Application] Export scraped data in CSV, JSON, and PDF formats.
- **Enhanced Scraper**: Support for infinite scroll and dynamic content handling.
- **UI Refresh**: Dark/light theme toggle and customizable layout.

### 🟠 Medium-term (3-6 Months)
- **Auto Summarizer (`auto-summarizer`)**: [Application] Automated content summarization with entity extraction.
- **Cloud Sync (`cloud-sync`)**: [Infrastructure] Opt-in cross-device sync for knowledge bases.
- **External AI APIs (`external-apis`)**: [Infrastructure] Support for OpenAI, Anthropic, and other cloud providers.
- **Collaboration Tools**: Shared knowledge base functionality for small teams.

### 🔴 Long-term Vision (6+ Months)
- **Scheduled Scraper (`scheduled-scraper`)**: [Application] Cron-based automated scraping with change detection.
- **Knowledge Graph (`knowledge-graph`)**: [Presentation] Interactive entity relationship visualization.
- **Plugin System (`plugin-system`)**: [Infrastructure] Extensible architecture with a community marketplace.
- **3D Visualization**: Immersive 3D representation of the Capability Architecture Map.

## 🛠 Technical Debt & Maintenance
- [x] Component-based architecture refactoring (Migrated to Native Web Components)
- [ ] Comprehensive unit test coverage
- [ ] Performance profiling and memory optimization
- [ ] Input sanitization and secure storage audit

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---
*Last Updated: March 19, 2026*
*This document is cross-referenced with the internal DOAP Architecture Map.*