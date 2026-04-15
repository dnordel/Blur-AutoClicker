# ROADMAP

## Completed
- Enabled runtime resizing for the main Tauri window and defined minimum size constraints to prevent clipping on high DPI setups.
- Added GUI-selectable scroll actions (Scroll Up / Scroll Down) alongside click actions in simple and advanced panels.
- Enabled stable bidirectional scrolling in panel containers with horizontal advanced-column scrolling and vertical column scrolling.

## Next
- Add an in-app setting to persist preferred window dimensions per panel.
- Add automated UI verification for 100%/150%/200% Windows scale factors.
- Add per-action tuning for scroll notch multiplier and independent scroll delay behavior.
- Add frontend scroll interaction tests that simulate wheel/trackpad and scrollbar dragging in Tauri WebView.
