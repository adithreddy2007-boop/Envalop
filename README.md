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

A card needs to end up somewhere both the sender's and the recipient's
browser can read it from. This app tries three backends, in order, all
behind the same `saveCard()` / `loadCard()` functions in `js/storage.js`:

**1. Firebase Firestore (recommended — real cross-device storage, free).**
If you fill in `js/firebase-config.js` with your own project's config, every
card is written to a real shared database, so the short 6-character code
works on any device, full stop. This is the path you want for an actual
deployment. Setup:

1. Create a free project at [console.firebase.google.com](https://console.firebase.google.com)
   (no credit card needed).
2. **Build → Firestore Database → Create database.** Start in test mode,
   or paste these rules (anyone can create/read a card by its code, nobody
   can modify or delete one — reasonable for a project like this):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /cards/{cardId} {
         allow read: if true;
         allow create: if true;
         allow update, delete: if false;
       }
     }
   }
   ```
3. **Project settings (gear icon) → Your apps → </> (web)** to register a
   web app — Firebase shows you a `firebaseConfig` object.
4. Paste those values into `js/firebase-config.js`. (This config is not a
   secret; Firestore is secured by the rules above, not by hiding it.)
5. Push the change, then test the code on two actually-different devices
   (e.g. your phone on mobile data) before trusting it.

**2. Claude's `window.storage`.** Only present when this runs as a
Claude.ai artifact; shared across anyone who opens that artifact. Used
automatically if Firebase isn't configured and this happens to be running
there.

**3. `localStorage` (the default until you do step 1 above).** Per-browser
only — the code will only work for re-opening the card yourself. The share
screen knows this and leads with the link instead (see below).

**The link, regardless of backend.** `js/link.js` also encodes the card's
text and photos directly into the URL's hash fragment
(`#d=<base64-encoded-json>`) — no storage involved at all, it just *is*
the data. This always works, even with zero setup, which is why it's what
the share screen leads with until Firebase is configured. The trade-off:
the link is long (tens of thousands of characters once photos are
included), and the voice note isn't in it — audio doesn't compress small
enough for a URL. Once Firestore is set up, the code becomes the
primary, clean way to share, and the link drops to a secondary option.

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
    ├── storage.js        save/load a card by code (Firestore → Claude → localStorage)
    ├── firebase-config.js fill this in to enable real cross-device storage
    ├── link.js            encodes/decodes a card directly into the share URL
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

- Set up `js/firebase-config.js` (see above) if you haven't yet — that's
  the one manual step left for full cross-device sharing.
- Add a Cloud Function (or a scheduled query) to delete cards older than
  N days, so the free tier never fills up.
- Add a tiny test suite around `screens.js` and `utils.js`, since both are
  pure functions.
- Persist drafts (so refreshing mid-creation doesn't lose progress).
