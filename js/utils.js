/**
 * utils.js
 * Small, pure, dependency-free helper functions. Nothing in this file
 * touches the DOM or app state, which keeps it easy to reason about
 * (and, in a larger project, easy to unit test).
 */

export function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/** 6-character, human-friendly code (no 0/O/1/I to avoid confusion). */
export function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/**
 * True if the page is being served from somewhere only this machine can
 * reach (Live Server, file://, a bare localhost/127.0.0.1, or a private
 * LAN IP). Links generated from a local address will never open on
 * someone else's device — there's nothing wrong with the link itself,
 * the address it's built from just isn't reachable from outside.
 */
export function isLocalOrigin() {
  const host = window.location.hostname;
  if (!host) return true; // file:// has no hostname at all
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  return false;
}

/** Replaces every {name} token in a template string with the given name. */
export function substituteName(template, name) {
  const safeName = (name || '').trim() || 'them';
  return template.split('{name}').join(safeName);
}

/** Resizes + compresses an uploaded image file, returns a JPEG data URL. */
export function compressImage(file, maxDim = 480, quality = 0.55) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Converts a Blob (e.g. a recorded audio clip) into a base64 data URL. */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read recording'));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
