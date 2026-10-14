# Validation — 2026.10.14-5

## Executed checks for this follow-up

- Full web Node regression suite: **484 passed**, zero failures or skips.
- Cloak integration in Chrome using actual key presses: stale unscoped Escape+Escape ignored; Shift+Z default; immediate S+X changes; saved Firebase settings restored after reload and on an independent browser; account isolation; intentionally configured Escape+Escape retained; Escape accepted during shortcut recording without dismissing Settings; repeat, long-held chords and blur reset. Complete desktop, iOS-sized and Android-sized settings/profile suites also passed.
- Media browser regressions: natural wheel scrolling in both directions for long text, three-page PDF and multi-page DOCX/PPTX without zoom controls or changing page geometry. Responsive Office fitting and isolated HTML passed. Existing image/video wheel zoom and fullscreen video transport passed. Separate real pinned-CDN DOCX/PPTX renderers were exercised on desktop and mobile with valid OOXML fixtures and zero page errors; screenshots were inspected.
- Screen focus browser regression: desktop/mobile focus visibility; no unfocused zoom; 100% minimum; 500/600/500/450 percent wheel transitions; independent multi-view zoom/pan; bounded drag without moving the viewport; drag release does not toggle controls; a subsequent real click does. Live source removal, reopening resets, source generation cleanup, compact inline viewers, transparent multi-view backgrounds, button placement and Hide Chat tooltip passed.
- Fullscreen checks: no native video playback toolbar or zoom badge, wheel zoom and drag work, clicks do not toggle controls, exit resets to 100%, and fullscreen survives repeated call updates. Paused frame images follow the live frame's zoom/pan while the pause status stays fixed.
- Performance check with live canvas video: 130 wheel events caused **zero layout measurements, zero roster renders, zero presence writes and zero global zoom passes**. A 100-event burst coalesced to one transform frame; its handlers took about 1.3 ms in this run. Two live decoded frames progressed during the roughly 214 ms sampling interval. The original video and viewport nodes remained mounted. These are local regression measurements, not a guarantee for every device/network.
- Independent browser review confirmed that a heartbeat during dragging retains the same tile and gesture, paused imagery retains the current transform, viewer tooltips survive refreshes, and no page errors occurred.
- File and HTTP startup smoke tests passed, including login, rooms, sending, polls, profiles, settings, schedules and navigation. Cached web-asset update and native-version-gate regressions passed with the new revision.
- Desktop/mobile screen context-menu and call UI regressions passed. Source syntax/whitespace checks passed.

## Boundaries

Tests use local Firebase fixtures; no production account, room, message or cloud configuration was modified. The shared test backend now preserves arrays while resolving timestamps, matching the dense shortcut arrays used by Firebase. Physical phone hardware and real user networks were not benchmarked.

Zoom transforms the original decoded video directly. It does not downsample it into a separate canvas, change capture/encoding constraints, or repeatedly rebuild the call roster. The existing 720p capture/network budget is preserved; magnification cannot recover detail absent from the transmitted source. Browser/device rendering and network latency cannot be guaranteed to be zero.

Escape no longer closes ordinary application modals. It may still dismiss a local context menu or collapse Time Display to its compact view. Browser fullscreen Escape/security behavior remains controlled by the browser.

Office previews require their pinned CDN dependencies on first use and may differ from native Office for advanced document features. Unsupported binary document types remain downloads. Document width fitting is automatic layout, not interactive zoom.

The preceding release's account, voice import/recording, manual screen pause/mute, mobile chat, upload and attachment changes remain included. This follow-up does not migrate authentication or deploy Firebase rules. The known historical default chat-files-sounds unread-fixture limitation documented in the prior release was not part of this follow-up; that unrelated suite is not claimed as rerun or passing here.

## Packaging

The final ZIP is verified against the supplied archive: exactly the same **463 file paths**, with no files added or removed. Every top-level folder contains fewer than 100 files recursively (largest: tests 92, js 83, desktop 74); 16 loose root files are uploaded together. GitHub's browser selection limit is external to this project. Upload top-level folders separately, or use Git/GitHub Desktop for the entire project at once.

Upload/storage code, B2/Worker configuration and native desktop source are unchanged. Test dependencies, browser profiles, screenshots, scratch scripts and logs are excluded. Build metadata, ZIP member timestamps and archive creation/modification times are refreshed during packaging. Every archived file is hash-compared with the final tested source.