# ROADMAP

## Completed
- Refactored `src/App.tsx` window resize effect dependencies to a panel-size key (`tab`, update-banner presence, explanation mode) so resize orchestration no longer depends on the full settings object.
- Split resize control-flow into helper routines for initial placement, shrink-then-snap, and direct grow paths to keep nesting shallow and behavior easier to reason about.
- Added guarded wheel-to-horizontal handling in Advanced mode using an `.advanced-columns` ref: vertical wheel deltas now map to `scrollLeft` only when horizontal overflow exists and nested vertical scrollers cannot consume the wheel.
- Implemented frontend scroll interaction tests for settings and advanced containers, including wheel-to-horizontal routing, scrollbar drag simulation, boundary clamping, and parent handoff behavior.
- Enabled runtime resizing for the main Tauri window and defined minimum size constraints to prevent clipping on high DPI setups.
- Added GUI-selectable scroll actions (Scroll Up / Scroll Down) alongside click actions in simple and advanced panels.
- Enabled stable bidirectional scrolling in panel containers with horizontal advanced-column scrolling and vertical column scrolling.
- Enforced a single scroll owner per panel mode: `.settings-panel` owns Settings vertical scroll, while Advanced mode uses `.advanced-columns` for horizontal wheel routing and `.advanced-col` containers for vertical overflow.
- Added development-only scroll ownership debug attributes and guarded wheel-routing logs to verify which container consumes wheel input.
- Added a UI-level settings panel regression test that verifies stable scroll-owner container identity, no scroll-container role churn during interactions, and overflow wheel stability.

## Next
- Add an in-app setting to persist preferred window dimensions per panel.
- Add automated UI verification for 100%/150%/200% Windows scale factors.
- Add per-action tuning for scroll notch multiplier and independent scroll delay behavior.
- Add an optional in-app toggle for scroll debug logging (`window.__BLUR_SCROLL_DEBUG__`) so QA can verify scroll-owner routing without devtools snippets.
