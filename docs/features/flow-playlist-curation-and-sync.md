---
state: "draft"
is_ready: false
created_at: "2026-10-14"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🎧 Flow Playlist Curation and Sync

This feature would turn FlowSync from a curated library into a living recommendation engine with exportable playlists.

## Problem to solve

The repository currently captures music and ratings, but it is not yet easy to turn high-performing tracks into a quick-to-use listening experience. The best flow tracks should be easy to assemble and share.

## Proposed experience

FlowSync could automatically generate and maintain playlists such as:

- instant-lock-in under 90 seconds
- deep work coding
- creative writing and ideation
- calm, low-distraction focus sessions
- high-energy cognitive sprint playlists

These playlists would be built from track entries with strong aggregate ratings and consistent time-to-flow data.

## Opportunities

- Generate curated playlists in Markdown or JSON for contributors and users
- Publish playlist summaries with metadata and rationale
- Allow a GitHub Action to sync favorite tracks to Spotify, YouTube Music, or Apple Music
- Add a simple web interface that displays the best flow playlists by use case

## Go-to-market value

The project is more compelling when users can go from discovery to listening without manual effort. A recommendation list is stronger when it becomes a playlist the user can immediately press play.

## Risks

- Playlists should be generated from verified data, not just popularity.
- Platform integrations require careful handling of licensing and service permissions.
- "Flow" is subjective, so playlist logic should be transparent and easy to review.

## Success criteria

- A curator can generate a playlist from top-rated tracks in a few clicks or one command.
- The playlist reflects objective metrics like time-to-flow and rating consistency.
- Users can tell why a track was selected and under what context it works best.
