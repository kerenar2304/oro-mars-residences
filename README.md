# ORO — Mars Residences

A scroll-driven marketing site for a fictional luxury residential development on Mars.

The homepage is one continuous film: a still opening frame followed by nine video
sequences, each decomposed into an image sequence and scrubbed by scroll position.
Two inner pages carry the detail.

## Live pages

| Page | File | What it is |
|---|---|---|
| The experience | `oro-mars/index.html` | Ten scroll-driven chapters, closing sequence loops |
| The Collection | `oro-mars/collection.html` | The four residence typologies |
| Life on Mars | `oro-mars/life.html` | The neighbourhood, the commons, getting there |

## Running it

The pages need to be served over HTTP (the frames are fetched as images, so
`file://` will not do). No build step, no dependencies:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File "oro-mars/serve.ps1" -Port 8123
```

Then open <http://localhost:8123>.

## How the scroll experience works

- **Image sequences.** Each source video is extracted to JPEG frames at 16 fps
  (`oro-mars/public/frames/seq02 … seq10`, 809 frames). A single `<canvas>` fixed to
  the viewport paints one frame per scroll position, cover-fitted so nothing distorts.
- **Eased scroll.** Frames are driven by a smoothed scroll value that chases the real
  one, which gives the sequence weight instead of a 1:1 twitch.
- **Section geometry.** Every chapter owns a slice of page height, calibrated to roughly
  1.75vh per frame so all sequences play at the same pace.
- **Progressive loading.** The hero and first sequence load behind a progress screen;
  the rest stream in during the narrative, one chapter ahead of the viewer.
- **Annotations.** In the Systems chapter the sequence plays out over the first 55% of
  the section and then holds, while callouts build over the frozen cutaway. Their
  anchors are stored in *image* coordinates and re-projected through the cover-crop each
  frame, so they stay pinned to the building at any viewport size.
- **Blink transitions.** Jumping to a non-adjacent chapter from the dot rail or the menu
  cuts across behind a shutter rather than scrubbing every frame in between.

## Regenerating the frames

Frames are derived from the `.mp4` files in the repository root. To rebuild them you
need [ffmpeg](https://ffmpeg.org/):

```bash
ffmpeg -i 2.mp4 -vf "fps=16,scale=1440:-2:flags=lanczos" -q:v 7 oro-mars/public/frames/seq02/%04d.jpg
```

If a sequence's frame count changes, update its `n` in the `SECTIONS` array.

## Lovable / React

Alongside each page is the same design as a native React + Tailwind component, ready to
drop into a Lovable project: `OroMarsExperience.tsx` and `TheCollection.tsx`. Design
tokens, fonts and keyframes to add to `index.css` / `tailwind.config.ts` are documented
in the header comment of `OroMarsExperience.tsx`.

## Brand

- **Display** Bruno Ace · **Body** Sansation
- **Ink** `#070503` · **Sand** `#EFE3D4` · **Terracotta** `#C4693F` · **Gold** `#E3B072`

---

Concept and design: Keren Arlihman. Renders and footage are project assets.
