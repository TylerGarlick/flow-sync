---
state: "draft"
is_ready: false
created_at: "2026-10-14"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🤖 AI-Assisted Flow Entry Generation

The purpose of this feature is to make it dramatically easier for contributors to add new flow-state reports without needing to manually format metadata or research track details.

## Why this matters

FlowSync depends on consistent, shareable records. Today, the barrier to entry is not just music taste—it is the work of turning a listening session into a structured record. An AI-assisted workflow would lower that barrier and make the repository more contributor-friendly.

## Core idea

When a user submits a link to a song, playlist, or stream, an AI agent can:

- infer the artist, album, title, and genre
- generate a correctly structured Markdown entry in the repository
- identify likely flow trigger timestamps from BPM, structure, and metadata
- draft contributor notes and context based on task type and environment
- place the file under the correct `music/{artist}/{genre}/{song}/{username}.md` path

## Proposed workflow

1. A user pastes a Spotify, YouTube, or Apple Music URL.
2. The app or agent resolves the track metadata.
3. The agent evaluates whether the track is a strong flow fit based on the current music profile.
4. It drafts a new record using the repository template.
5. The contributor reviews, edits, and submits a PR.

## Benefits

- Faster onboarding for new contributors
- More consistent metadata across entries
- Easier capture of time-to-flow and trigger points
- Reduced chance of formatting or slugging mistakes

## Risks and guardrails

- AI-generated metadata should still be human-reviewed.
- Contributors should be able to override inferred timestamps and descriptions.
- The generated Markdown should be clearly labeled as a draft until approved.

## Success criteria

- A user can submit a link and receive a draft file in under two minutes.
- Generated entries include the required fields and pass human review.
- Contributors feel confident making small edits instead of starting from scratch.
