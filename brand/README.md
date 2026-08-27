# Brand masters

Kept out of `web/public/` on purpose. Anything in that folder is served to the
public and cloned on every deploy, and these are source files the site does
not use:

- `emg-mark-master.png` — the pristine 800px RGBA hexagon mark. The site
  serves `emg-mark.webp` (lossless, same pixels, smaller) and
  `emg-mark-sm.webp` (256px) generated from this. Regenerate with:
      ffmpeg -i emg-mark-master.png -c:v libwebp -lossless 1 emg-mark.webp
      ffmpeg -i emg-mark-master.png -vf scale=256:256 -c:v libwebp -lossless 1 emg-mark-sm.webp
  NEVER convert this to an 8-bit palette: it silently drops the alpha channel
  and puts a black square behind the logo.
- `emg-logo-full.png` — full lockup, unused by the site, kept for documents.

`web/public/emg-logo.png` is the black-square version and IS used, as the
browser-tab icon, where a solid background is correct.
