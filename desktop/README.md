# macOS desktop app

The app supports Apple Silicon and Intel, with macOS 11 as its deployment target.
Build a release using the desktop resource folder (character, icon, catalog,
photos and WAV clips) from the previous release:

```sh
bash scripts/build-macos-desktop.sh /path/to/Contents/Resources /path/to/new-build 1.4.7 147
```

The output folder must be new. The script compiles both architectures, adds the
bundle-local Frameworks search path, embeds the toolchain's Swift concurrency
back-deployment library, signs the bundle ad hoc, checks both architectures and
runs a hidden startup check before creating the ZIP. It does not install the app
or replace an existing running copy.

Swift concurrency is provided by the system on macOS 12 and newer. macOS 11
needs the back-deployment runtime in the app's Frameworks directory. Do not force
the older runtime on a newer OS with DYLD_LIBRARY_PATH. Background:
https://forums.swift.org/t/build-the-concurrency-library-for-back-deployment-what-does-this-merged-request-mean-in-practice/52000

After extracting the final ZIP to a fresh directory, run:

```sh
codesign --verify --deep --strict '/path/to/치이 친구.app'
'/path/to/치이 친구.app/Contents/MacOS/HachiwareDesktop' --startup-check
```

The startup check exercises the Cocoa main loop, Swift task scheduling and
MainActor dispatch, character decoding, catalog decoding and one bundled photo.
It hides the menu-bar item and mascot, exits automatically and does not save
preferences. It does not verify video playback or user interaction. Check those
in the actual app when the desktop is unlocked, and test macOS 11 on that OS
before claiming its behavior is verified.

Ad-hoc signature validation confirms the packaged files are intact; this is not
an Apple Developer ID signature or notarization.

If Finder says the app cannot open because it is not responding, quit the hung
process in Activity Monitor, fully extract the new ZIP, replace the previous
app in Applications, and reopen it. If it persists, request the macOS version
and diagnostic report. Do not change Gatekeeper settings for this error.

The mascot stays visible when other apps are active and restores its position
after wake, display changes, Space changes and reopening. Dragging updates its
base position only while the mascot itself is being dragged. Positions are
clamped with room for idle motion on the closest available display.

Run the geometry regression checks before building:

```sh
xcrun swiftc desktop/PetPosition.swift desktop/tests/main.swift -o /tmp/hachiware-position-check
/tmp/hachiware-position-check
```

These checks cover every mascot size, offscreen positions, disconnected displays,
negative display coordinates and invalid saved coordinates. They do not replace
manual sleep, display reconnect and Space-switch testing on the target Mac.

The macOS photo window has a dedicated “보관함 저장하기” button. It passes the exact displayed catalog ID and a stable request UUID to the default browser; only the website can confirm the IndexedDB write. “웹사이트 바로가기” opens the site without importing. The collection belongs to that browser/profile. Both actions stay in a compact, centered horizontal row rather than stretching across the photo window.

Daily draw history survives app restarts and resets at midnight in Asia/Seoul. Exhausted categories fall back to other unseen-today photos; full-day exhaustion shows a message. Older app versions did not record encounter dates, so the native daily ledger starts on upgrade.

```sh
xcrun swiftc desktop/DesktopPhotos.swift desktop/tests/photos.swift -o /tmp/hachiware-photo-check
/tmp/hachiware-photo-check
node scripts/check-daily-draws.mjs
```
