<div align="center">

# 📝 Todo Overlay

**Instant overlay todo list with global hotkey**

*Press `Shift+Space` anywhere to capture tasks. Built with Rust + Tauri + React.*

[![GitHub release](https://img.shields.io/github/v/release/simcmoi/todo-overlay?color=blue&label=version)](https://github.com/simcmoi/todo-overlay/releases/latest)
[![GitHub downloads](https://img.shields.io/github/downloads/simcmoi/todo-overlay/total?color=success)](https://github.com/simcmoi/todo-overlay/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/simcmoi/todo-overlay?style=social)](https://github.com/simcmoi/todo-overlay/stargazers)

[🌐 Website](https://simcmoi.github.io/todo-overlay) • [📥 Download](https://github.com/simcmoi/todo-overlay/releases) • [📖 Docs](docs/README.md) • [🐛 Issues](https://github.com/simcmoi/todo-overlay/issues)

</div>

---

## ✨ Features

Todo Overlay is a **cross-platform desktop app** that appears instantly over any window with a single keyboard shortcut. Built with **Rust** and **React** for native performance and modern UI.

**Core Features:**
- ⚡ **Global hotkey overlay** - Press `Shift+Space` anywhere, anytime
- 🔒 **100% offline & private** - Local JSON storage, no cloud, no tracking
- 🪶 **Ultra-lightweight** - ~10MB download, <50MB RAM usage
- 🚀 **Native performance** - Built with Rust + Tauri (not Electron)
- 🌍 **Cross-platform** - macOS (Intel + Apple Silicon), Windows, Linux
- 🎨 **Modern UI** - Beautiful interface with dark/light mode
- 🔄 **Auto-updates** - Seamless background updates with code signing

**Productivity:**
- 📋 Multiple lists with color labels
- 🔗 Unlimited nested subtasks
- 📅 Dates, reminders & native notifications
- 🎯 Drag & drop organization
- 🗑️ Archive & history
- 🔍 Search & filter across all tasks

> Perfect for developers, designers, and anyone who needs quick task capture without breaking flow.

---

## 📸 Screenshots

> *Screenshots coming soon! The app features a minimal, modern design.*

---

## 🚀 Quick Start

### Download

- 🍎 **[macOS (.dmg)](https://github.com/simcmoi/todo-overlay/releases/latest)** - Universal (Intel + Apple Silicon)
- 🪟 **[Windows (.msi)](https://github.com/simcmoi/todo-overlay/releases/latest)** - Recommended installer
- 🐧 **[Linux (.AppImage)](https://github.com/simcmoi/todo-overlay/releases/latest)** - Universal (all distros)

Or visit **[Releases](https://github.com/simcmoi/todo-overlay/releases)** for all versions (.exe, .deb, older versions).

### Usage

1. **Install and launch** - The app appears in your system tray
2. **Press `Shift+Space`** - Opens the overlay instantly
3. **Start typing** - Your first task is auto-focused

That's it! The app runs in the background and can be summoned anytime with `Shift+Space`.

---

## 🛠️ Tech Stack

**Frontend:** React 19 • TypeScript • Vite • TailwindCSS • shadcn/ui • Zustand • Framer Motion

**Backend:** Rust • Tauri 2.10 • JSON storage • Native APIs

**Why Tauri?** Native performance without Electron bloat. 10x smaller binaries, 3x faster startup, lower memory usage.

---

## 👨‍💻 Development

```bash
# Clone and install
git clone https://github.com/simcmoi/todo-overlay.git
cd todo-overlay
npm install

# Run in dev mode (with hot reload)
npm run tauri dev

# Build for production
npm run tauri build

# Run tests
npm test

# Create a release (automated)
npm run release          # Patch: 0.2.1 → 0.2.2
npm run release:minor    # Minor: 0.2.1 → 0.3.0
```

**Prerequisites:** Node.js 20+ • Rust 1.70+

For detailed setup instructions, platform-specific dependencies, and contribution guidelines, see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## 📖 Documentation

- 📚 **[Complete Documentation](DOCUMENTATION.md)** - Full guides, setup, and troubleshooting
- 🤝 **[Contributing Guide](CONTRIBUTING.md)** - How to contribute code or docs
- 🚀 **[Release Workflow](docs/RELEASE_WORKFLOW.md)** - Automated release process
- 🔑 **[Code Signing Setup](docs/GENERER_CLES.md)** - Configure auto-updates
- 📝 **[Changelog](CHANGELOG.md)** - Version history and updates

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- Setting up your development environment
- Code style and conventions
- Pull request process
- Reporting bugs and requesting features

---

## 📄 License

MIT License © 2024 [Simon Fessy](https://github.com/simcmoi)

See [LICENSE](LICENSE) for details.

---

<div align="center">

### Made with ❤️ using Rust and React

**[⭐ Star this project](https://github.com/simcmoi/todo-overlay)** • **[📥 Download](https://github.com/simcmoi/todo-overlay/releases)** • **[📖 Read the docs](DOCUMENTATION.md)**

</div>
