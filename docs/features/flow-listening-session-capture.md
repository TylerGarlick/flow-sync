---
state: "draft"
is_ready: false
created_at: "2026-10-15"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🎙️ Flow Listening Session Capture

Let a listener explicitly mark a flow-state moment while music is playing and optionally identify the current song from a short, consented audio sample.

## Problem to solve

People may not notice exactly when they enter flow, and remembering the track and timestamp afterward is unreliable. A lightweight capture flow could associate a listener-confirmed flow event with the music they were hearing.

## Proposed experience

1. The user starts or enables a listening session and sees when audio capture is active.
2. When they notice flow, they mark the moment or confirm a prompt; the app records the event time and asks for any missing context.
3. If the current player exposes track metadata, use it first. Otherwise, only with explicit permission, capture a short temporary audio sample and request song identification.
4. Show the likely match for user confirmation, then offer to save a draft report using the existing FlowSync template.

## Identification service

**AudD** is a candidate recognition provider. Its [standard recognition API](https://docs.audd.io/) accepts an audio file or audio URL and can return artist/title and optional Apple Music or Spotify metadata. Its documentation also describes separate stream and enterprise offerings; confirm pricing, retention, allowed use, and access to any required endpoints before implementation.

Audio fingerprinting identifies a likely recording; it does not establish that a user was in flow or reliably identify every kind of media source. Flow events and source attribution must be confirmed by the user. Prefer player-provided metadata or recognized song links when available.

## Privacy and safety requirements

- Audio capture is off by default, opt-in, clearly indicated, and controlled by an explicit start/stop action.
- Capture only the minimum short sample needed for identification; process it in memory and discard it immediately after the request unless the user separately chooses to save it.
- Do not upload microphone audio or ambient conversations by default. Make the capture source explicit and let users choose supported system-audio capture where the OS permits it.
- Explain that a third-party recognition service receives the sample before upload. Never send audio without per-session consent.
- Keep API tokens on a trusted backend or secure local storage; do not bundle service secrets in a distributable Electron renderer.
- Let users review, edit, or discard the match and generated report. Do not treat an inferred match as a confirmed contribution.

## Success criteria

- A user can mark and confirm a flow moment without interrupting their work.
- The app uses existing player metadata where possible and requests audio recognition only after consent.
- Recognition results are presented as candidates and can be corrected or rejected.
- Samples are not retained by FlowSync after recognition, and no flow-state claim is made without user confirmation.
