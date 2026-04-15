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
- Each panel mode must declare and preserve a single primary scroll owner to avoid competing overflow containers.
- Advanced columns must translate wheel `deltaY` into horizontal `scrollLeft` only when horizontal overflow exists and only prevent default scrolling when horizontal movement is consumed.

## Validation
- Select Scroll Up and Scroll Down from simple panel and advanced panel.
- Start automation and confirm wheel events are produced.
- Verify Toggle/Hold modes and stop/failsafe behavior remain functional.
- Scenario 1: Settings panel vertical wheel scrolling moves `scrollTop` and consumes wheel only when movement is possible.
- Scenario 2: Advanced panel columns convert wheel intent to horizontal movement (`deltaY` → `scrollLeft`) only when `scrollWidth > clientWidth` and only call `preventDefault()` when the horizontal container consumes movement.
- Scenario 3: Advanced column containers independently consume vertical wheel movement (`scrollTop`) before parent routing.
- Scenario 4: Scrollbar drag interaction updates position in each scrollable container (settings panel, advanced columns, advanced columns' vertical containers).
- Scenario 5: Boundary behavior clamps at top/bottom/left/right and hands wheel events to the parent container when child movement is no longer possible.

- Scenario 6: Wheel events originating in nested vertically-scrollable descendants keep normal vertical behavior until that nested container reaches a boundary, after which parent horizontal routing may apply.
- Scenario 7: Settings mode uses `.settings-panel` as the authoritative vertical scroller while `.panel-area` remains non-scrolling.
- Scenario 8: Development builds expose per-container `data-scroll-owner` attributes and guarded wheel-routing logs to verify wheel-consumption ownership.
