# Freya Music Buttons

A small static GitHub Pages app built as an accessible cause-and-effect music interface.

## Files

- `index.html` contains the app shell.
- `styles.css` defines the large touch targets and responsive layout.
- `app.js` contains the obvious `SOUND_BUTTONS` configuration section for labels, colors, symbols, and audio filenames.
- `audio/` contains original generated demo WAV files for public use.
- `tools/generate_demo_audio.py` recreates the demo audio files.

## Changing Sounds

Replace files in `audio/`, then update the `file` values in `app.js`.

Do not commit copyrighted commercial recordings, such as an MP3 of "Royals" by Lorde, to a public GitHub Pages repository unless you have distribution rights. For copyrighted favorites, use a legal private/local supply path or an authorized streaming/embed mechanism that remains simple enough for Freya's interface.

## GitHub Pages

Publish the repository with GitHub Pages from the repository root. No build step is required.
