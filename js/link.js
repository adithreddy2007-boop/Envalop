/**
 * link.js
 * The real fix for cross-device sharing: instead of handing someone a
 * short code that points at data sitting in *your* browser's storage
 * (which their browser can never see), this encodes the card itself
 * into the URL's hash fragment. Whoever opens the link decodes it
 * client-side — no server, no shared storage, works on any device.
 *
 * Trade-off: the link is long (it's carrying real data, including
 * photos), and the voice note is deliberately left out of it — audio
 * doesn't compress small enough to put in a URL. Voice notes still
 * work when both people share the same browser storage (see
 * storage.js) — this module only handles the "always works" path for
 * the message and photos.
 */

const HASH_KEY = 'd';

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Builds a full, self-contained URL that opens directly to this card. */
export function buildShareLink(card) {
  const payload = {
    s: card.senderName || '',
    n: card.name || '',
    v: card.vibe,
    r: card.relationship,
    m: card.message || '',
    p: card.photos || []
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = `${HASH_KEY}=${encoded}`;
  return url.toString();
}

/**
 * Builds a short link that just points at the stored card by its code
 * (?card=CODE) instead of embedding the data. Only meaningful once a real
 * shared backend is configured (see storage.js) — otherwise the code it
 * points to won't exist anywhere the recipient's browser can read it.
 */
export function buildShortLink(code) {
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  url.searchParams.set('card', code);
  return url.toString();
}

/** Reads & decodes card data from the current URL's hash, if present. */
export function readCardFromLink() {
  const hash = window.location.hash || '';
  const match = hash.match(new RegExp(`(?:^#|[#&])${HASH_KEY}=([^&]+)`));
  if (!match) return null;

  try {
    const payload = JSON.parse(fromBase64Url(match[1]));
    return {
      senderName: payload.s || '',
      name: payload.n || '',
      vibe: payload.v || null,
      relationship: payload.r || null,
      message: payload.m || '',
      photos: Array.isArray(payload.p) ? payload.p : [],
      voice: null,
      voiceDuration: 0
    };
  } catch (e) {
    return null; // malformed/corrupted hash — treat as no link data
  }
}
