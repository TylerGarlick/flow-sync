---
state: "draft"
is_ready: false
created_at: "2026-10-15"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🖥️ Electron Flow Music Player

Build a desktop app for discovering community-tested FlowSync songs, opening them in a supported music service, and proposing new songs from a URL.

## Problem to solve

FlowSync's Markdown catalog contains community listening reports, but users must browse repository files and separately find a way to listen. That makes it difficult to discover tracks by the qualities that matter to a work session.

## Proposed experience

- Browse community entries and filter by **genre**, **artist**, or **song**.
- Search by title or artist and show useful FlowSync context such as rating, time-to-flow, work type, and trigger timestamps.
- Select a track and play it through a supported provider or open its provider link in the user's browser/app.
- Paste a supported song URL to resolve its metadata, review a draft FlowSync entry, and submit it as a contribution.

## Playback and contribution boundaries

- FlowSync provides discovery and deep links; it does not host, download, or redistribute copyrighted audio.
- Use provider-supported playback SDKs only where their platform terms and desktop-app requirements allow it. Otherwise, open the canonical link in the provider or browser.
- A URL-based addition creates a reviewable draft and ultimately a pull request; it never writes directly to the default branch or overwrites another contributor's report.
- Reuse the repository's Markdown template and metadata lookup/generation behavior rather than implementing a second song-entry format.
- The community catalog remains the source of FlowSync ratings and reports. Provider metadata is supplemental and must be confirmed by the user.

## Risks and guardrails

- Provider APIs and playback permissions vary by service, account tier, geography, and platform. Validate the selected integrations before promising in-app playback.
- Treat pasted URLs as untrusted input: allowlist supported hosts, parse known URL patterns, and do not retrieve arbitrary remote content.
- Make the playback destination and contribution changes visible before the user proceeds.
- Keep provider tokens in OS-backed secure storage where needed; do not commit secrets or expose them in logs.

## Success criteria

- Users can find community songs by genre, artist, and title and see the corresponding FlowSync reports.
- A selected song can be played through an approved integration or opened through its provider link.
- Users can start a song contribution from a supported URL and review the generated entry before submitting it.
- The app does not store or serve copyrighted audio.
