---
state: "draft"
is_ready: false
created_at: "2026-10-14"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🔌 MCP Repository Authoring Server

Build an MCP server that lets an AI assistant interact with FlowSync's repository through a small set of safe, purpose-built tools. The first use case is creating correctly structured Markdown song reports from a contributor's listening-session details.

## Problem

Contributors currently need to locate the right directory, copy the template, fill in metadata, and create a pull request themselves. This is repetitive and makes it easy to introduce inconsistent slugs, missing fields, or malformed Markdown.

## Proposed MCP tools

- `search_tracks`: find existing entries and templates so the assistant can avoid duplicates and follow repository conventions.
- `get_song_template`: return the current report template and required fields.
- `create_flow_report`: create a report from user-provided listening-session data, generating the expected artist/genre/song path and validating the content.
- `update_flow_report`: update an existing report, with explicit confirmation before changing community-contributed content.
- `open_contribution`: prepare a branch and pull request for contributor review rather than writing directly to the default branch.

## Example workflow

1. The contributor tells their assistant what they listened to and describes their focus session, or provides a track URL.
2. The assistant uses MCP tools to check for an existing report and retrieve the current template.
3. The assistant gathers any missing required information and drafts the report.
4. The contributor reviews and confirms the proposed file.
5. The server validates the fields, path, and Markdown, then creates a branch and pull request.

## Safety and permissions

- Never write directly to the default branch; create changes on a contributor branch and submit them for review.
- Require user confirmation before creating or modifying repository content.
- Use the least-privilege GitHub permissions needed for repository reads and pull-request creation.
- Validate slugs, required metadata, ratings, and timestamps server-side.
- Treat track links and generated metadata as untrusted input; do not execute or fetch arbitrary URLs without explicit allowlisting and safe handling.
- Keep credentials in the MCP host's secret store and never expose tokens to the model or commit them.

## Benefits

- Turn a conversational description of a focus session into a reviewable repository contribution.
- Keep generated reports aligned with the latest template and repository structure.
- Reduce duplicate entries and formatting mistakes.
- Make FlowSync usable from any compatible MCP client without requiring a dedicated web app first.

## Success criteria

- A contributor can create a validated draft report through an MCP-compatible assistant.
- New reports follow the current template and path conventions.
- All changes are reviewable through pull requests, with no direct default-branch writes.
- The server can report validation errors clearly and let the contributor correct the draft before submission.
