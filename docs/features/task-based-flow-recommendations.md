---
state: "draft"
is_ready: false
created_at: "2026-10-14"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🎯 Task-Based Flow Recommendations

This feature would help users discover music that matches the kind of work they are trying to do, instead of relying on generic "focus playlists."

## The problem

A single song can induce flow for writing, but feel distracting for coding or analysis. People perform different types of deep work with different musical patterns, and FlowSync should reflect that.

## Product idea

Add a recommendation system that tags each track by:

- work type: coding, writing, design, research, reading, math, planning
- sensory profile: minimal, atmospheric, rhythmic, cinematic, ambient, instrumental
- time-to-flow range: under 60s, 60-120s, 120-300s
- pace and intensity: soft, moderate, high-energy

## User experience

A user could select:

- "I need to debug a complex issue"
- "I want to draft a proposal"
- "I am doing data analysis"
- "I need a calm, non-distracting environment"

FlowSync would then recommend tracks ranked by how often users reached flow under those work conditions.

## Data model additions

Each entry could gain a few structured fields such as:

- `preferred_work_types`
- `time_to_flow_seconds`
- `environment`
- `intensity_level`
- `voice_profile`
- `lyrics_presence`

## Benefits

- Better recommendations for real-world work contexts
- More actionable discovery than raw genre browsing
- Stronger community signal because recommendations are tied to outcomes

## Example use cases

- A developer preparing for a difficult refactor gets a list of tracks with low-distraction, steady rhythmic structure.
- A writer gets softer, atmospheric tracks that support creative depth without vocal interference.
- A researcher doing dense reading gets instrumental tracks with minimal dynamic swings.

## Success criteria

- Users can filter tracks by task type and flow outcome.
- Recommendations improve the perceived usefulness of the repository.
- Contributors can add work context without adding freeform chaos.
