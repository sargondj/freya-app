# Freya Music Buttons

A small static GitHub Pages app built as an accessible cause-and-effect music interface.

## Files

- `index.html` contains the app shell.
- `styles.css` defines the large touch targets and responsive layout.
- `app.js` contains the obvious `SOUND_BUTTONS` configuration section for labels, colors, shapes, and audio filenames.
- `manifest.webmanifest` asks supported installed web-app surfaces to keep the app portrait-oriented.
- `favicon.svg` is a four-color app icon using the button colors.
- `icons/` contains simple SVG illustrations for the four music buttons.
- `audio/` contains real wind-chime, owl, and whale recordings plus an original purple-button demo.
- `ASSET_CREDITS.md` records source links, licenses, and edits for public audio and illustrations.
- `tools/generate_demo_audio.py` recreates only the original purple-button demo. It does not overwrite the real recordings.

## Changing Public Demo Sounds

Replace files in `audio/`, then update the `file` values in `app.js`. Button icons can be changed with the `icon` values in the same configuration block. Only put files in this public repository when you have the right to distribute them publicly.

## Private Audio For The Purple And Owl Buttons

The purple and owl buttons can use copyrighted or privately owned audio files without adding those files to GitHub. Each file is selected on a phone or tablet and saved only inside that browser's private local storage. The app does not upload it or commit it to the repository. The owl button retains its public great horned owl recording until a private file is selected on that device.

To set it up on a device:

1. Put the audio file somewhere the device's browser can pick it from. On iPhone, save it in the Files app, such as On My iPhone or iCloud Drive. On Android, save it in Files/Downloads/Drive or another file-provider location.
2. Open the app with `?setup=1` at the end of the URL. Example: `https://sargondj.github.io/freya-app/?setup=1`.
3. Tap `Private audio for purple button` or `Private audio for owl button`, choose the matching audio file, and wait for the status message. For the supplied Cornell recording, choose `Great_Horned_Owl_Duet.mp3` for the owl button.
4. Use the `Open Freya buttons` link, or open the normal app URL again without `?setup=1`, for Freya's regular four-button screen.

Notes:

- MP3, M4A, AAC, and WAV are the safest formats across iPhone Safari and Android Chrome. The file picker explicitly allows `.mp3` because some mobile file providers do not advertise MP3 files as `audio/*`.
- Apple Music, Spotify, YouTube Music, and other streaming/DRM tracks usually cannot be selected as plain audio files. Use an audio file that the browser can access through the system file picker.
- Each private button has to be configured separately on each device and browser. Clearing browser site data will remove those selections.
- Browser pages cannot reliably force portrait orientation on iPhone and Android. The app requests portrait orientation in its web-app manifest and tries the Screen Orientation API after a tap, but unsupported browsers quietly ignore those requests. Installing the page to the home screen gives the browser the best chance of honoring portrait orientation.

## GitHub Pages

Publish the repository with GitHub Pages from the repository root. No build step is required.
