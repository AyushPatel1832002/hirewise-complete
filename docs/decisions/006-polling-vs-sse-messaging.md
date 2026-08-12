# ADR 006 — Short-interval polling over SSE/WebSocket for messaging

**Status:** Accepted · **Date:** August 12, 2026 · **Context:** Phase 3

## Context

The ATS conversation view needs new messages to appear promptly. Server-Sent Events and WebSockets offer push semantics but add infrastructure: sticky sessions on autoscaling hosts, heartbeat/reconnection logic, and a persistent connection surface to secure.

## Decision

The conversation sheet uses **5-second interval polling** on `ats.conversation`, combined with **optimistic send** (the sent message is rendered immediately, rolled back on error) and server-side **unread counts** (`ats.unreadCounts`) so new employer replies are flagged without polling the message body constantly.

## Consequences

**Positive:** zero new infrastructure; works identically across hosting modes (autoscale/serverless, where long-lived connections are unreliable anyway); every read path reuses existing indexed queries; optimistic UI makes perceived latency near zero.

**Negative:** 5-second delivery lag and repeated queries even when idle (mitigated — the conversation query only runs while the sheet is open, and counts are cheap); at tens of thousands of concurrent open conversations, a push system would become necessary.
