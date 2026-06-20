# Dearly — say it properly

A small web app for writing a real card — a written message, up to three
photos, and a 60-second voice note — wrapped in an animated reveal
(envelope → orb-tap unlock → photos & voice → final card) and shared with
a 6-character code.

No build step, no framework, no backend. Open it, write a card, share the
code with someone, they type it in and get the reveal.

---

## Quick start

Because the app is split into ES modules (`<script type="module">`),
opening `index.html` directly by double-clicking it **won't work** — browsers
block module imports over the `file://` protocol. Run it from a tiny local
server instead:

```bash
# any of these work — pick whichever you have installed
npx serve .
python3 -m http.server 8000
php -S localhost:8000
```

Then open `http://localhost:8000` (or whatever port it prints).

To put it online for real, drag the folder into
[Netlify Drop](https://app.netlify.com/drop), or push it to a repo and turn
on **GitHub Pages**. Either way, no configuration is needed — it's static
files.

---

## How sharing actually works

There's no server, so "sharing" a card means persisting it somewhere both
the sender's and the recipient's browser can read it from. `js/storage.js`
abstracts this behind two functions, `saveCard()` / `loadCard()`, with a
small adapter underneath:

- **Inside Claude.ai**, if this is opened as a Claude artifact, it uses the
  `window.storage` API Claude injects, which is genuinely shared across
  anyone who opens that artifact.
- **Hosted anywhere else**, it falls back to the browser's `localStorage`.
  That means sharing only works *within the same browser* (e.g. two tabs)
  unless you swap in a real backend.

That second point is a deliberate, honest limitation of a frontend-only
project — and the reason storage is isolated in one file. To make sharing
work across devices for real, you'd point `saveCard`/`loadCard` at an actual
API (a few lines of Express + a database, or a hosted key-value store like
Supabase/Firebase) without touching anything else in the app.

---

## Project structure

```
dearly-project/
├── index.html          entry point — markup + module script tag
├── css/
│   └── styles.css      all styling, organized by section
└── js/
    ├── data.js         content: the 6 "vibes" and 4 relationship types
    ├── utils.js         pure helpers (no DOM, no state — escapeHtml, image
    │                     compression, etc.)
    ├── state.js          the single mutable state object + reset helper
    ├── storage.js        save/load a card by code (see above)
    ├── audio.js           mic recording + playback (MediaRecorder)
    ├── screens.js          pure functions: state in, HTML string out
    ├── view.js              owns the DOM: render(), envelope drag,
    │                         orb taps, confetti, starfield
    ├── actions.js            event delegation + the actions they trigger
    └── app.js                entry point: boots everything
```

The dependency direction is one-way (`app → actions → {view, audio,
storage} → screens → {state, data, utils}`), so nothing here is circular —
each file only knows about the ones below it in that list.

### Why this split

It's a genuine separation of concerns, not just file-splitting for its own
sake:

- **`data.js`** is content. A non-developer could edit the wording in here
  without touching any logic.
- **`screens.js`** is a pure view layer — every function is `state in,
  HTML string out`, nothing else. That makes the UI easy to reason about
  and trivial to unit test if you wanted to add tests later.
- **`state.js`** is the one object everything else reads and writes. There's
  no framework reactivity here on purpose — at this size, a plain object
  plus an explicit `render()` call after every mutation is simpler than
  reaching for a state-management library.
- **`storage.js` / `audio.js`** isolate the two browser APIs (storage,
  `MediaRecorder`) that are the most likely to need swapping out later.

## The flow

**Creating a card:** your name → their name → vibe (Feel Good / Sorry /
Birthday / Congrats / Thank You / Miss You) → relationship (Friend /
Partner / Spouse / Date) → confirm the display name, pick one of two
written-for-them message options (or write your own), add up to 3 photos
and one voice note → generate → get a share code.

**Opening a card:** enter the code → envelope with a slide-to-open control
→ tap 4 floating orbs to reveal it (the first photo sharpens as you go,
and each orb pops a little burst of its own icon) → the other two photos
plus the voice note → the final card, signed with the sender's name.

## Browser support notes

- Voice recording needs microphone permission and works best in
  Chromium-based browsers (Chrome, Edge). Safari's `MediaRecorder` support
  is less consistent.
- Everything else (uploads, the drag-to-open envelope, image compression
  via `<canvas>`) is standard and works across modern browsers.

## Possible next steps

- Swap `storage.js`'s adapter for a real backend to make sharing work
  across devices.
- Add a tiny test suite around `screens.js` and `utils.js`, since both are
  pure functions.
- Persist drafts (so refreshing mid-creation doesn't lose progress).
