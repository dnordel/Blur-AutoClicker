# SPEC TEMPLATE

## Feature
Click + Scroll Automation Modes

## Problem
Users can only configure mouse click actions from the GUI and cannot select scroll wheel automation.

## Requirements
- GUI must expose both click actions and scroll wheel directions.
- Existing hotkey and timing controls must continue to work with scroll actions.
- Input simulation must remain interruptible by existing stop/failsafe logic.
- Panel containers must support visible, usable bidirectional scrolling when content exceeds viewport bounds.
- Advanced mode must support horizontal scroll across columns and independent vertical scroll within each column.
- Advanced mode wheel input must translate vertical wheel deltas into horizontal column scroll when horizontal overflow exists.
- A user-configurable wheel-to-horizontal sensitivity control must be available via slider and numeric input.
- Wheel handling must preserve native vertical behavior in nested vertical-scrollable regions and only call preventDefault when horizontal movement occurs.

## Validation
- Select Scroll Up and Scroll Down from simple panel and advanced panel.
- Start automation and confirm wheel events are produced.
- Verify Toggle/Hold modes and stop/failsafe behavior remain functional.
- Confirm mouse wheel/trackpad and scrollbar drag both work in all panels inside the desktop wrapper.
- Set wheel-to-horizontal sensitivity to 0.2, 1.0, and 5.0 and verify horizontal movement scales proportionally.
- Verify wheel events over nested vertically-scrollable content continue vertical scrolling without forcing horizontal movement.
- Verify preventDefault is only triggered when advanced columns scrollLeft actually changes.
