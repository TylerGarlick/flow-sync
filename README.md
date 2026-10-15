<div align="center">

# 🎧 FlowSync (`awesome-flow-music`)

**A crowdsourced, open-source library mapping the exact musical moments that trigger deep work and instant flow state.**

[![Awesome](https://awesome.re/badge.svg)](https://github.com/topics/awesome)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

[The Goal](#-the-goal) • [How It Works](#-how-it-works) • [Repository Structure](#-repository-structure) • [How to Participate & Experiment](#-how-to-participate--experiment) • [Contributing](#-contributing) • [Roadmap](#-roadmap)

</div>

---

## 🎯 The Goal

Music is one of the fastest triggers for human focus, but not all "study music" is created equal. **FlowSync** is an open experiment to crowdsource and quantify the exact tracks—and specific timestamps within them—that plunge listeners into a **flow state** in record time.

Whether you are refactoring code, writing a novel, analyzing complex data, or designing, our goal is to eliminate mental boot-up time and get you into the zone **under 2 minutes**.

---

## 🔬 How It Works

Rather than providing arbitrary music reviews, every entry in FlowSync captures **empirical, contextual focus data**:

1. **Time to Flow:** How long it takes before background chatter fades.
2. **Trigger Timestamps:** Specific moments in a song (e.g., dynamic drops, rhythm stabilization, ambient layer introduction) that lock your brain into focus.
3. **Work Context:** What type of task was being performed (e.g., high-logic debugging vs. creative writing).
4. **Community Verification:** A built-in testing log where other users try the track during their work sessions and leave reviews/ratings.

---

## 📁 Repository Structure

Entries are organized using clean, URL-friendly slugs for seamless browsing and web integration:

```text
music/
└── {artist-slug}/
    └── {genre-slug}/
        └── {song-title-slug}/
            ├── index.md           # Song overview & aggregated stats (optional)
            └── {username}.md      # Individual focus report
```

*Example Path:* `music/tycho/ambient-downtempo/a-walk/johndoe.md`

---

## 🧪 How to Participate & Experiment

You don't need to be a developer to participate! You can use this repository in two primary ways:

### 1. Test Existing Tracks
1. Browse the [`/music`](./music) directory or check out our curated [Playlists](#-curated-playlists).
2. Put on headphones and start working on a focused task.
3. Check the **Flow Trigger Points** in the track's Markdown file to see if you enter the zone at the same timestamps.
4. Leave a verification review on that song's file via a Pull Request or issue!

### 2. Submit Your Flow Triggers
Got a track that instantly locks you in? Share it with the community by submitting a new entry.

---

## 🛠️ Contributing

We love contributions! FlowSync follows a standard GitHub fork-and-pull-request model similar to the *Awesome List* ecosystem.

### Quick Start: Adding Your Song

1. **Fork** this repository to your account.
2. **Create a branch** for your addition (`git checkout -b add/artist-song-username`).
3. **Copy the Template** found in [`docs/TEMPLATE.md`](docs/TEMPLATE.md).
4. **Add your file** under `music/{artist-slug}/{genre-slug}/{song-title-slug}/{your-username}.md`.
5. **Commit & Push** your changes.
6. **Open a Pull Request (PR)** against our `main` branch.

For detailed guidelines on file formatting, slug naming conventions, and review steps, please read our full [**Contributing Guidelines**](docs/CONTRIBUTING.md).

---

## 🎵 Curated Playlists

Using community metrics (`time_to_flow_seconds` and overall ratings), we regularly compile fast-focus playlists:

* ⚡ **Instant Lock-In (< 90 Seconds to Flow):** *Coming Soon*
* 💻 **Deep Code & Logic (No Lyrics, High Tempo):** *Coming Soon*
* ✍️ **Creative Writing & Brainstorming (Ambient / Cinematic):** *Coming Soon*

---

## 🗺️ Roadmap & Future Plans

- [ ] **Genre-Specific Curations:** Deep dives into synthwave, ambient, classical, atmospheric black metal, video game OSTs, and brown noise compositions.
- [ ] **FlowSync Web App:** A web interface allowing users to filter tracks by task type, BPM, or time-to-flow.
- [ ] **Automated Playlist Generation:** GitHub Actions to automatically sync top-rated tracks to Spotify, Apple Music, and YouTube playlists.

---

## 💬 Community & Feedback

Have ideas, questions, or feedback?
* Open an issue in [Discussions](../../discussions) to talk about focus music psychology.
* Found a broken link or incorrect metadata? [Open an Issue](../../issues).

**License:** [MIT](LICENSE) © FlowSync Contributors
