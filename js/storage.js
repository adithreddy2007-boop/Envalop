/**
 * storage.js
 * Persistence layer for sharing a created card with its recipient.
 *
 * This app can run in two contexts:
 *  1. Inside Claude.ai, where a `window.storage` API is injected that
 *     persists data tied to this artifact (works across users who open
 *     the same artifact link).
 *  2. As a standalone, hosted page (e.g. GitHub Pages) — `window.storage`
 *     won't exist there, so we fall back to the browser's localStorage.
 *
 * localStorage is per-browser, so in a standalone deployment "sharing"
 * only works within the same browser (e.g. two tabs) unless you add a
 * real backend. See the README for notes on swapping in a server-backed
 * adapter without touching any other module — that's the whole point of
 * isolating storage behind this one file.
 */

import { makeCode } from './utils.js';

const hasClaudeStorage =
  typeof window !== 'undefined' &&
  window.storage &&
  typeof window.storage.get === 'function' &&
  typeof window.storage.set === 'function';

const memoryFallback = new Map(); // last-resort, used only if localStorage is unavailable

async function rawSet(key, value) {
  if (hasClaudeStorage) {
    return window.storage.set(key, value, true);
  }
  try {
    localStorage.setItem(key, value);
    return { key, value };
  } catch (e) {
    memoryFallback.set(key, value);
    return { key, value };
  }
}

async function rawGet(key) {
  if (hasClaudeStorage) {
    // Claude's storage throws on a missing key — let that propagate.
    return window.storage.get(key, true);
  }
  try {
    const v = localStorage.getItem(key);
    if (v !== null) return { key, value: v };
  } catch (e) {
    /* localStorage unavailable (e.g. privacy mode) — fall through */
  }
  if (memoryFallback.has(key)) return { key, value: memoryFallback.get(key) };
  throw new Error('not found');
}

function cardKey(code) {
  return `dearly:card:${code}`;
}

export async function saveCard(card) {
  const payload = JSON.stringify({
    senderName: card.senderName,
    name: card.name,
    vibe: card.vibe,
    relationship: card.relationship,
    message: card.message,
    photos: card.photos,
    voice: card.voice,
    voiceDuration: card.voiceDuration,
    createdAt: Date.now()
  });
  const res = await rawSet(cardKey(card.id), payload);
  if (!res) throw new Error('Save failed');
}

export async function loadCard(code) {
  const res = await rawGet(cardKey(code));
  return JSON.parse(res.value);
}

/** Generates a 6-character code, checking storage to avoid collisions. */
export async function generateUniqueCode() {
  for (let i = 0; i < 6; i++) {
    const candidate = makeCode();
    try {
      await rawGet(cardKey(candidate));
      // no throw => a card already exists with this code, try again
    } catch (e) {
      return candidate; // lookup failed => code is free to use
    }
  }
  // Extremely unlikely fallback: append a time-based suffix for guaranteed uniqueness.
  return makeCode() + Date.now().toString(36).slice(-3).toUpperCase();
}

export const storageMode = hasClaudeStorage ? 'claude-artifact' : 'local-browser';
