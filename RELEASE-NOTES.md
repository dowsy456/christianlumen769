# Release 2026.10.14-5

- Natural scrolling for multi-page PDF, DOCX and PPTX and text/HTML previews; no document zoom badge or wheel interception. Image/video zoom remains.
- Focused, fullscreen and multi-view screen/camera zoom with a 100% minimum, bounded drag-to-pan, independent per-feed state and reliable click-versus-drag handling. Unfocused tiles cannot zoom. Leaving the viewing mode resets zoom and pan.
- Frame-coalesced per-tile transforms avoid global layout work during wheel/drag input. The existing source resolution, encoding and network budgets remain in place; magnification cannot add missing source pixels.
- Compact zoom status and viewers button; viewers attached to the label. Transparent multi-view backgrounds retain the label, viewers and percentage while omitting minimize/fullscreen/close actions.
- Multi Screen View button moved left of Show Chat with matching styling; the tooltip changes to Hide Chat when chat is open.
- Blackout cloak reads the active saved shortcut instead of a stale legacy setting. Default Shift+Z, custom chords, shortcut editing and reload persistence are repaired. Escape no longer closes application modals.

The preceding account, media, voice, screen pause/mute, mobile chat and attachment embed changes remain included. All 463 source paths and existing upload/storage configuration are preserved. Each top-level folder remains below 100 files. Upload folders separately, then the 16 loose root files. Uploading all 463 files in one operation requires Git/GitHub Desktop; ZIP changes cannot remove GitHub's browser selection limit.

No production Firebase, B2, Worker or GitHub changes were deployed. Native desktop version remains 1.7.2. See VALIDATION.md for executed checks. ZIP timestamps and build-info.json are refreshed during final packaging.
