#!/bin/bash
set -euo pipefail

# Usage: build-macos-desktop.sh <resource-folder> <new-output-folder> <version> <build-number>
# The resource folder contains character.png, Hachiware.icns, catalog.json,
# photos/, motion WAVs and the Usagi voice clips from the desktop release.
resource_dir="$(cd "$1" && pwd)"
output_dir="$2"
version="$3"
build_number="$4"
repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
[[ ! -e "$output_dir" ]] || { echo 'Use a new output folder to preserve previous builds.' >&2; exit 1; }
for resource in character.png Hachiware.icns catalog.json photos usagi-voices.json; do
  [[ -e "$resource_dir/$resource" ]] || { echo "Missing resource: $resource" >&2; exit 1; }
done
mkdir -p "$output_dir"
output_dir="$(cd "$output_dir" && pwd)"
app_dir="$output_dir/치이 친구.app"
mkdir -p "$app_dir/Contents/MacOS" "$app_dir/Contents/Frameworks"
/usr/bin/ditto --norsrc --noextattr "$resource_dir" "$app_dir/Contents/Resources"
for arch in arm64 x86_64; do
  /usr/bin/xcrun swiftc -O -target "$arch-apple-macosx11.0" \
    -framework Cocoa -framework WebKit \
    -Xlinker -rpath -Xlinker '@executable_path/../Frameworks' \
    "$repo_dir/desktop/Main.swift" -o "$output_dir/HachiwareDesktop-$arch"
done
/usr/bin/lipo -create "$output_dir/HachiwareDesktop-arm64" "$output_dir/HachiwareDesktop-x86_64" \
  -output "$app_dir/Contents/MacOS/HachiwareDesktop"

# Swift concurrency is in the OS starting with macOS 12. macOS 11 needs the
# toolchain's back-deployment runtime inside the app and a bundle-local rpath.
runtime_paths="$(/usr/bin/xcrun swift-stdlib-tool --print \
  --scan-executable "$app_dir/Contents/MacOS/HachiwareDesktop" --platform macosx)"
concurrency_runtime="$(printf '%s\n' "$runtime_paths" | /usr/bin/awk '/\/libswift_Concurrency.dylib$/{print;exit}')"
[[ -f "$concurrency_runtime" ]] || { echo 'Missing Swift concurrency back-deployment runtime.' >&2; exit 1; }
/usr/bin/ditto --norsrc --noextattr "$concurrency_runtime" "$app_dir/Contents/Frameworks/libswift_Concurrency.dylib"
while IFS= read -r library; do
  [[ -f "$app_dir/Contents/Frameworks/$library" ]] || { echo "Missing bundle runtime: $library" >&2; exit 1; }
done < <(/usr/bin/otool -L "$app_dir/Contents/MacOS/HachiwareDesktop" | /usr/bin/awk '/@rpath\/libswift_/{sub(/^.*@rpath\//,"");sub(/ .*/,"");print}' | /usr/bin/sort -u)

cat > "$app_dir/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleDisplayName</key><string>치이 친구</string>
<key>CFBundleExecutable</key><string>HachiwareDesktop</string>
<key>CFBundleIconFile</key><string>Hachiware</string>
<key>CFBundleIdentifier</key><string>local.hachiware.desktop</string>
<key>CFBundleName</key><string>치이 친구</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>$version</string>
<key>CFBundleVersion</key><string>$build_number</string>
<key>LSMinimumSystemVersion</key><string>11.0</string>
<key>LSUIElement</key><true/>
<key>NSHighResolutionCapable</key><true/>
<key>NSPrincipalClass</key><string>NSApplication</string>
</dict></plist>
PLIST
/usr/bin/plutil -lint "$app_dir/Contents/Info.plist"
/usr/bin/codesign --force --sign - "$app_dir/Contents/Frameworks/libswift_Concurrency.dylib"
/usr/bin/codesign --force --sign - "$app_dir"
/usr/bin/codesign --verify --deep --strict --verbose=2 "$app_dir"
/usr/bin/lipo "$app_dir/Contents/MacOS/HachiwareDesktop" -verify_arch arm64 x86_64
/usr/bin/lipo "$app_dir/Contents/Frameworks/libswift_Concurrency.dylib" -verify_arch arm64 x86_64
"$app_dir/Contents/MacOS/HachiwareDesktop" --startup-check
/usr/bin/ditto -c -k --norsrc --noextattr --keepParent "$app_dir" "$output_dir/HachiwareDesktop-macOS.zip"
/usr/bin/shasum -a 256 "$output_dir/HachiwareDesktop-macOS.zip"
