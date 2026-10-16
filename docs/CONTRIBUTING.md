# Contributing to FlowSync

First off, thank you for taking the time to contribute to FlowSync! 🎉

Your submissions help creators, developers, writers, and thinkers everywhere get into their flow state faster.

---

## 📐 General Guidelines

To keep the repository searchable and structured:

1. **Use Slugs:** Directory and file names MUST be lowercase, alphanumeric, and hyphen-separated.
   * ✅ `hans-zimmer`
   * ❌ `Hans_Zimmer` or `Hans Zimmer`
2. **Instrumental Preferred:** Songs with clear english lyrics often distract language processing. Instrumental, vocal ambient, or foreign language tracks generally yield the best flow states.
3. **Be Specific with Timestamps:** Don't just list a song—tell us *when* and *why* it shifts your brain state.

---

## 📝 Step-by-Step Pull Request Process

1. **Fork the Repository:** Click the "Fork" button at the top right of the main repository page.
2. **Clone your Fork:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/awesome-flow-music.git
   cd awesome-flow-music
   ```
3. **Create a Feature Branch:**
   ```bash
   git checkout -b add-song/artist-title
   ```
4. **Generate Your Entry:** From the repository root, run `bun run generate:song`. Provide a MusicBrainz recording URL, Apple Music song URL, or song title and artist. Review metadata candidates, choose a curated genre, and enter your own listening-session details when prompted. The generator previews both changes and writes only after confirmation.
   * Use `bun run generate:song -- --dry-run` to preview without writing.
   * Generated entry path: `music/{artist-slug}/{genre-slug}/{song-title-slug}/index.md`.
   * The generator updates `music/index.md` and never overwrites an existing song entry.
   * Do not use external metadata to invent your flow rating, time-to-flow, whether flow was achieved, work context, environment, description, or trigger timestamps.
   * The GraphQL preview and generation workflow is documented in [`docs/song-entry-generator.md`](song-entry-generator.md); its write mutation is disabled unless an administrator configures the private `SONG_ENTRY_WRITE_TOKEN`.
5. **Commit and Push:**
   ```bash
   git add .
   git commit -m "add: Flow entry for {Song Title} by {Artist}"
   git push origin add-song/artist-title
   ```
6. **Open a Pull Request:** Go to the original repository and click **Compare & Pull Request**. Fill out the PR template and wait for review!

---

## 🧪 Reviewing Existing Tracks

If you don't have new music to submit, you can review existing tracks!

1. Locate a track in `music/`.
2. Test it during a deep work session.
3. Edit the track's Markdown file to add your username and rating to the **Community Reviews** table.
4. Submit a PR titled `review: {username} review for {song-title}`.
