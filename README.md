# I am listening

A photo-and-sound project.

During a trip across Morocco, I met people and asked each of them one question:
**what is a song you would like me to listen to?** I photographed that moment, and
paired each portrait with their song. No name, no title, no word — just a face and a music.

**Click a portrait to listen.**

## How it works

A single static page — no framework, no build step, no dependencies.

```
index.html          markup + entrance placard + player + enlarge view
styles.css          the look (dark "museum wall")
main.js             gallery rendering + audio player + lightbox
data.js             the people: name + photo + song (the only file you edit)
portraits/          portrait images (.jpg)
musique_portrait/   audio files (.mp3 / .m4a)
```

## Run it

Just **open `index.html`** in your browser (double-click it). The data lives in `data.js`,
so no local server is needed.

## Add a new portrait + song

1. Drop the photo in `portraits/` (e.g. `amina.jpg`).
2. Drop the audio in `musique_portrait/` (e.g. `Her Song.mp3`).
3. Add one entry to `data.js`:

```js
{ "name": "Amina", "photo": "amina.jpg", "song": "musique_portrait/Her Song.mp3" },
```

That's it. Filenames with spaces or accents are fine (they're URL-encoded automatically).

## Deploy on GitHub Pages

Same as before: Settings → Pages → Source: deploy from `main` (root). Push your changes
and the live site updates — **no `python` step required**. It goes live at
`https://<user>.github.io/<repo>/`.

## Notes

- **Audio size.** `musique_portrait/` is large (~180 MB). It works on GitHub Pages, but
  for faster loads and a lighter repo you can re-encode to ~128 kbps mono, e.g.
  `ffmpeg -i in.mp3 -b:a 128k -ac 1 out.mp3`.
- **Unused files.** `portraits/Alaoui.jpg` and `portraits/no music.jpg` have no song yet,
  and one derbouka track is not paired — add them to `data.json` when ready.
