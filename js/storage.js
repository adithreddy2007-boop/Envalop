/**
 * storage.js
 * Persistence layer for sharing a created card with its recipient.
 *
 * Backends, tried in this order:
 *  1. Firebase Firestore — if js/firebase-config.js has been filled in
 *     with a real project, every card is saved to a real shared
 *     database, so a short code genuinely works on any device. This is
 *     the recommended path for a hosted deployment (see README).
 *  2. Claude's `window.storage` — present only when this runs as a
 *     Claude.ai artifact; shared across anyone who opens that artifact.
 *  3. `localStorage` — last resort. Per-browser only, so a code only
 *     works for re-opening the card yourself, not for sharing it.
 *
 * Everything above this list — every other module — just calls
 * `saveCard()` / `loadCard()` and doesn't know or care which backend
 * is actually in use. That's the point of isolating it here.
 */

import { makeCode } from './utils.js';
import { firebaseConfig } from './firebase-config.js';

const FIREBASE_SDK_VERSION = '10.12.2'; // check firebase.google.com/docs/web/setup for the current version
const FIRESTORE_COLLECTION = 'cards';

const isFirebaseConfigured =
  !!firebaseConfig &&
  !!firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY';

const hasClaudeStorage =
  typeof window !== 'undefined' &&
  window.storage &&
  typeof window.storage.get === 'function' &&
  typeof window.storage.set === 'function';

const memoryFallback = new Map(); // last-resort, used only if localStorage is unavailable too

/* ---------------------------------------------------------------- */
/* Firestore (lazy-loaded only if configured, so there's no cost or  */
/* network request at all for anyone who hasn't set it up)           */
/* ---------------------------------------------------------------- */
let firestorePromise = null;

function loadFirestore() {
  if (!isFirebaseConfigured) return Promise.resolve(null);
  if (firestorePromise) return firestorePromise;

  firestorePromise = (async () => {
    try {
      const { initializeApp } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
      );
      const { getFirestore, doc, getDoc, setDoc } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
      );
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      return { db, doc, getDoc, setDoc };
    } catch (err) {
      console.error('Dearly: Firebase failed to load — falling back to local storage.', err);
      return null;
    }
  })();

  return firestorePromise;
}

function cardKey(code) {
  return `dearly:card:${code}`;
}

/* ---------------------------------------------------------------- */
/* Public API                                                         */
/* ---------------------------------------------------------------- */
export async function saveCard(card) {
  const payload = {
    senderName: card.senderName,
    name: card.name,
    vibe: card.vibe,
    relationship: card.relationship,
    message: card.message,
    photos: card.photos,
    voice: card.voice,
    voiceDuration: card.voiceDuration,
    createdAt: Date.now()
  };

  const fs = await loadFirestore();
  if (fs) {
    try {
      await fs.setDoc(fs.doc(fs.db, FIRESTORE_COLLECTION, card.id), payload);
      return;
    } catch (err) {
      console.error('Dearly: Firestore write failed — falling back to local storage.', err);
      // fall through to the local fallbacks below
    }
  }

  const json = JSON.stringify(payload);
  if (hasClaudeStorage) {
    const res = await window.storage.set(cardKey(card.id), json, true);
    if (!res) throw new Error('Save failed');
    return;
  }
  try {
    localStorage.setItem(cardKey(card.id), json);
  } catch (e) {
    memoryFallback.set(cardKey(card.id), json);
  }
}

export async function loadCard(code) {
  const fs = await loadFirestore();
  if (fs) {
    try {
      const snap = await fs.getDoc(fs.doc(fs.db, FIRESTORE_COLLECTION, code));
      if (snap.exists()) return snap.data();
      throw new Error('not found');
    } catch (err) {
      if (err && err.message === 'not found') throw err;
      console.error('Dearly: Firestore read failed — falling back to local storage.', err);
      // fall through to the local fallbacks below
    }
  }

  if (hasClaudeStorage) {
    const res = await window.storage.get(cardKey(code), true); // throws if missing
    return JSON.parse(res.value);
  }
  try {
    const v = localStorage.getItem(cardKey(code));
    if (v !== null) return JSON.parse(v);
  } catch (e) {
    /* localStorage unavailable (e.g. private browsing) */
  }
  if (memoryFallback.has(cardKey(code))) return JSON.parse(memoryFallback.get(cardKey(code)));
  throw new Error('not found');
}

/** Generates a 6-character code, checking storage to avoid collisions. */
export async function generateUniqueCode() {
  for (let i = 0; i < 6; i++) {
    const candidate = makeCode();
    try {
      await loadCard(candidate);
      // no throw => a card already exists with this code, try again
    } catch (e) {
      return candidate; // lookup failed => code is free to use
    }
  }
  // Extremely unlikely fallback: append a time-based suffix for guaranteed uniqueness.
  return makeCode() + Date.now().toString(36).slice(-3).toUpperCase();
}

export const storageMode = isFirebaseConfigured
  ? 'firebase'
  : hasClaudeStorage
    ? 'claude-artifact'
    : 'local-browser';
