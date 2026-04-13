# KAKERA

> *Your anime collection, one fragment at a time.*

![CI](https://github.com/ClementBobin/Kakera/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Linux%20%7C%20Windows-lightgrey)
![Tauri](https://img.shields.io/badge/tauri-v2-24C8D8)

---

## What is Kakera?

> Kakera (欠片) means *fragment* in Japanese — each anime in your collection is a piece of a larger world you're building.

Kakera is a desktop GUI companion to `ani-cli` that brings your AniList, MyAnimeList, and Kitsu libraries to your desktop with full sync, smart filtering, download management, and a release calendar — all in a fast, native app.

---

## Features

- [ ] Sync with AniList, MyAnimeList, Kitsu
- [ ] Filter by: downloaded, unwatched, started, favorites, completed, per-service
- [ ] Sort by: alphabetical, episode count, last watched, last updated, unwatched count, last episode, score, broadcast season, random, and more
- [ ] Grid and list view modes with configurable density
- [ ] Anime release calendar (timeline + list UI) with new season alerts
- [ ] Custom collections (e.g. "isekai", "comfort rewatch")
- [ ] Browse by studio, author, genre, voice actors
- [ ] `ani-cli` integration: launch playback at preferred quality
- [ ] Episode & batch download with configurable download directory
- [ ] Franchise/derivation tree: see all seasons, OVAs, and side stories with release timeline
- [ ] Multi-theme: light, dark, auto — with presets (slate, wallbash)
- [ ] Overlay badges: downloaded count, unwatched count, resume button, language, local source

---

## Screenshots

<!-- Add screenshots here -->

---

## Installation

Download the latest release from [GitHub Releases](https://github.com/ClementBobin/Kakera/releases):

| Platform | Format | Download |
|----------|--------|---------|
| Linux | `.deb` | [Latest release](https://github.com/ClementBobin/Kakera/releases/latest) |
| Linux | `.AppImage` | [Latest release](https://github.com/ClementBobin/Kakera/releases/latest) |
| Windows | `.msi` | [Latest release](https://github.com/ClementBobin/Kakera/releases/latest) |
| Windows | `.exe` (NSIS) | [Latest release](https://github.com/ClementBobin/Kakera/releases/latest) |

---

## Build from source

### Prerequisites

- [Rust](https://rustup.rs/) stable (1.77+)
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- **Linux only:** `libwebkit2gtk-4.1-dev libayatana-appindicator3-dev librsvg2-dev`

### Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm tauri dev

# Build for production
pnpm tauri build
```

---

## Contributing

See [docs/contributing.md](docs/contributing.md) for setup instructions, branch naming, PR checklist, and how to add Tauri commands.

---

## License

MIT © [Kakera Contributors](https://github.com/ClementBobin/Kakera/graphs/contributors)