# Base44 Code Downloader

Download your Base44 project source code as a ZIP directly from the Chrome tab you already have open.

This extension is built for makers who want a quick local backup, a handoff to another developer, or a starting point for moving a Base44 app into a normal Git workflow.

## Version 1.0.2

- Fixed exports that missed nested directories such as `src/api`, `src/components/ui`, `base44/entities`, and `base44/functions`.
- Added automatic file-tree discovery when the direct Base44 code endpoint is unavailable.
- Preserved full folder paths and scoped file selection to the active directory, including duplicate filenames.
- Updated editor recovery to read visible code from the Base44 editor DOM.

## Why People Use It

- One-click project detection from the active Base44 editor tab.
- ZIP export for easy backup and sharing.
- Automatic fallback when Base44 blocks direct file reads.
- Editor-DOM recovery mode for projects that can only be read through the editor.
- No backend, no account, no external server. Everything runs locally in your browser.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select this extension folder.

## How To Download A Project

1. Open your project in `app.base44.com`.
2. Click the Base44 Code Downloader icon.
3. Click `Detect project`.
4. Click `Download ZIP`.

If Base44 returns `412 App does not support direct file reads`, the extension automatically falls back to reading files through the editor.

## Fallback Mode

Some Base44 projects do not expose the direct `/code` endpoint. In that case the extension can switch files in the editor and read the code from the Monaco DOM.

You can also open `Emergency mode: file list`, detect paths from the current page, edit the list, and download only the files you want.

## Privacy

The extension reads code from the active Base44 tab and generates the ZIP locally in Chrome. It does not upload your code to any third-party service.

## Contributing

Pull requests are welcome. Good first ideas:

- Better automatic file tree detection.
- Support for more Base44 project layouts.
- Progress bar for large projects.
- Export metadata such as app name and timestamp.
- Better UI states and error messages.

If this helped you rescue or back up a project, star the repo so more builders can find it.
