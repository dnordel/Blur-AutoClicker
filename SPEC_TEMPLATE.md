# SPEC TEMPLATE

## Feature
Window Sizing & DPI Compatibility

## Problem
The desktop UI can be clipped at high OS scale factors.

## Requirements
- Main window must be resizable.
- Minimum size must preserve core controls and title bar.
- Behavior must be consistent across DPI scaling settings.

## Validation
- Launch app at 100%, 150%, 200% scale.
- Confirm no clipping after manual resize.
