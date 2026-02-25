# Repository Configuration Checklist

Complete these steps to optimize your GitHub repository for maximum discoverability and SEO.

## ✅ Repository Settings

### 1. About Section (Top Right)

**Description:**
```
⚡ Fast, privacy-first todo app with global hotkey overlay. Built with Rust + Tauri + React. Cross-platform desktop task manager for macOS, Windows & Linux.
```

**Website:**
```
https://simcmoi.github.io/todo-overlay
```

**Topics:** (See [TOPICS.md](TOPICS.md) for full list)
```
todo-app, task-manager, productivity-app, tauri, rust, react, typescript, desktop-app, cross-platform, macos-app, windows-app, linux-app, privacy-first, offline-first, overlay-app, global-hotkey, keyboard-shortcuts, lightweight-app, open-source, electron-alternative
```

### 2. Repository Options

Go to **Settings** → **General**:

- ✅ **Features**:
  - ☑️ Issues (enabled)
  - ☑️ Discussions (enabled - for community Q&A)
  - ☑️ Projects (optional)
  - ☑️ Wiki (optional - if you want community-editable docs)

- ✅ **Pull Requests**:
  - ☑️ Allow merge commits
  - ☑️ Allow squash merging
  - ☑️ Allow rebase merging
  - ☑️ Automatically delete head branches

- ✅ **Archives**:
  - ☑️ Include Git LFS objects in archives

### 3. Social Preview Image

Go to **Settings** → **General** → **Social preview**:

- Upload a 1280x640px image (OpenGraph image)
- Should show the app logo/screenshot
- Will appear when sharing on social media

**TODO:** Create `social-preview.png` (1280x640px) showing the app

### 4. GitHub Pages

Go to **Settings** → **Pages**:

- ✅ Source: `gh-pages` branch
- ✅ Custom domain (optional): `todo-overlay.yourdomain.com`
- ✅ Enforce HTTPS

**Current URL:** https://simcmoi.github.io/todo-overlay

### 5. Security

Go to **Settings** → **Security**:

- ✅ Enable **Dependabot alerts**
- ✅ Enable **Dependabot security updates**
- ✅ Enable **Secret scanning**
- ✅ Add **SECURITY.md** file (for vulnerability reporting)

## ✅ Repository Files

### Essential Files (All Created ✅)

- ✅ `README.md` - Comprehensive, SEO-optimized
- ✅ `LICENSE` - MIT License
- ✅ `CONTRIBUTING.md` - Contribution guidelines
- ✅ `CHANGELOG.md` - Version history
- ✅ `DOCUMENTATION.md` - Full documentation hub
- ✅ `.github/FUNDING.yml` - Sponsorship options
- ✅ `.github/TOPICS.md` - GitHub topics guide

### Optional Enhancement Files

- ⏳ `SECURITY.md` - Security policy
- ⏳ `.github/ISSUE_TEMPLATE/` - Issue templates
- ⏳ `.github/PULL_REQUEST_TEMPLATE.md` - PR template
- ⏳ `CODE_OF_CONDUCT.md` - Code of conduct

## ✅ Badges & Shields

Already added to README.md:

```markdown
[![GitHub release](https://img.shields.io/github/v/release/simcmoi/todo-overlay?color=blue&label=version)](https://github.com/simcmoi/todo-overlay/releases/latest)
[![GitHub downloads](https://img.shields.io/github/downloads/simcmoi/todo-overlay/total?color=success)](https://github.com/simcmoi/todo-overlay/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tauri](https://img.shields.io/badge/Tauri-2.10-FFC131?logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange?logo=rust)](https://www.rust-lang.org)
[![GitHub stars](https://img.shields.io/github/stars/simcmoi/todo-overlay?style=social)](https://github.com/simcmoi/todo-overlay/stargazers)
```

## ✅ SEO Keywords

### In README.md (Bottom)

Already added comprehensive keyword list for search engines.

### In package.json

```json
{
  "keywords": [
    "todo",
    "task-manager",
    "productivity",
    "overlay",
    "tauri",
    "rust",
    "react",
    "desktop-app",
    "cross-platform",
    "hotkey",
    "keyboard-shortcuts",
    "privacy-first",
    "offline",
    "open-source"
  ]
}
```

### In Cargo.toml

```toml
[package]
keywords = ["todo", "task-manager", "productivity", "overlay", "tauri"]
categories = ["gui", "command-line-utilities"]
```

## ✅ Social Media & Community

### GitHub Social Features

- ✅ Star the repo yourself (to show it's active)
- ✅ Enable Discussions for Q&A
- ✅ Pin important issues/discussions
- ✅ Use GitHub Projects for roadmap (optional)

### External Promotion

After launch, consider posting on:

- 🐦 **Twitter/X** - Developer community
- 🟠 **Reddit** - r/rust, r/reactjs, r/productivity
- 🟠 **Hacker News** - Show HN
- 💬 **Dev.to** - Blog post about building it
- 💬 **Product Hunt** - Launch announcement
- 💬 **Tauri Discord** - Showcase channel

## ✅ Advanced SEO

### GitHub Search Ranking Factors

1. **Repository name** - Contains keywords ✅ "todo-overlay"
2. **Description** - Clear, keyword-rich ✅
3. **Topics** - Relevant tags ✅
4. **README content** - Comprehensive ✅
5. **Activity** - Regular commits, issues, PRs ⏳
6. **Stars** - Social proof ⏳
7. **Forks** - Community engagement ⏳
8. **Contributors** - Active development ⏳

### Google Search Optimization

- ✅ Structured README with headers (H2, H3)
- ✅ Rich content (features, examples, docs)
- ✅ External links (landing page)
- ✅ Keywords in first paragraph
- ✅ Alt text for images (when added)

## 📊 Analytics (Optional)

### GitHub Insights

Monitor these metrics:
- **Traffic** - Views and unique visitors
- **Clones** - Repository clones
- **Referring sites** - Where traffic comes from
- **Popular content** - Most viewed files

Access at: `https://github.com/simcmoi/todo-overlay/graphs/traffic`

### Landing Page Analytics

Consider adding to `web/landing/`:
- Google Analytics (privacy-respecting)
- Plausible Analytics (open-source alternative)
- Umami (self-hosted option)

## 🎯 Next Steps

1. **Immediate** (Do Now):
   - [ ] Add topics to repository (Settings → About → Topics)
   - [ ] Update repository description
   - [ ] Enable Discussions (Settings → Features)
   - [ ] Enable Dependabot (Settings → Security)

2. **Short-term** (This Week):
   - [ ] Take screenshots of the app
   - [ ] Create animated demo GIF
   - [ ] Create social preview image (1280x640)
   - [ ] Add issue templates
   - [ ] Write first blog post

3. **Long-term** (Ongoing):
   - [ ] Respond to issues and PRs promptly
   - [ ] Write regular updates in Discussions
   - [ ] Share milestones on social media
   - [ ] Create video tutorial (YouTube)
   - [ ] Submit to app directories (AlternativeTo, etc.)

## ✅ Verification Checklist

Before announcing the project publicly:

- [ ] README is complete and professional
- [ ] License is present (MIT)
- [ ] Contributing guidelines are clear
- [ ] All badges work and show correct info
- [ ] Landing page is live and working
- [ ] Latest release is available with binaries
- [ ] Documentation is comprehensive
- [ ] Issues are enabled and templates added
- [ ] Security policy is in place
- [ ] Social preview image is set

---

**Last Updated:** 2024 (Update after completing each section)

