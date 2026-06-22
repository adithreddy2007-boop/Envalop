/**
 * firebase-config.js
 *
 * Fill this in with your own Firebase project's config to enable real
 * cross-device sharing via a short code. Until you do, the app keeps
 * working exactly as before (link-based sharing, same-device code) —
 * nothing breaks if you leave this as placeholders.
 *
 * HOW TO GET THESE VALUES (~10 minutes, free, no credit card):
 *   1. Go to https://console.firebase.google.com and create a project.
 *   2. In the project, open "Build → Firestore Database" → Create database
 *      → start in test mode (or paste the rules from the README).
 *   3. Open Project settings (gear icon) → "Your apps" → click the
 *      </> (web) icon to register a web app.
 *   4. Firebase shows you a `firebaseConfig` object — copy those values
 *      into the object below. (This config is NOT a secret — it's safe
 *      to commit and safe to be public. Firestore is secured by the
 *      Security Rules you set in step 2, not by hiding this object.)
 *
 * Double-check the SDK version used in storage.js against
 * https://firebase.google.com/docs/web/setup while you're there — pin a
 * version that's current when you set this up.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyA1v1NxS6SV7IvJxmpFrfRYMHaIcFIuXzU",
  authDomain: "dearly-1f0e5.firebaseapp.com",
  projectId: "dearly-1f0e5",
  storageBucket: "dearly-1f0e5.firebasestorage.app",
  messagingSenderId: "113655331756",
  appId: "1:113655331756:web:2e2667f5f0325e554a5809"
};

/**
 * The public URL of your open.html page.
 * This is what gets copied alongside the code on the share screen.
 * Update this to match wherever you've deployed open.html.
 */
export const OPEN_PAGE_URL = 'https://adithreddy2007-boop.github.io/Envaloop/';
