# ROADMAP

## Completed
- Added guarded wheel-to-horizontal handling in Advanced mode using an `.advanced-columns` ref: vertical wheel deltas now map to `scrollLeft` only when horizontal overflow exists and nested vertical scrollers cannot consume the wheel.
- Implemented frontend scroll interaction tests for settings and advanced containers, including wheel-to-horizontal routing, scrollbar drag simulation, boundary clamping, and parent handoff behavior.
- Enabled runtime resizing for the main Tauri window and defined minimum size constraints to prevent clipping on high DPI setups.
- Added GUI-selectable scroll actions (Scroll Up / Scroll Down) alongside click actions in simple and advanced panels.
- Enabled stable bidirectional scrolling in panel containers with horizontal advanced-column scrolling and vertical column scrolling.

## Next
- Add an in-app setting to persist preferred window dimensions per panel.
- Add automated UI verification for 100%/150%/200% Windows scale factors.
- Add per-action tuning for scroll notch multiplier and independent scroll delay behavior.
