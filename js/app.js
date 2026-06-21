/**
 * app.js
 * Entry point. Loaded as a module from index.html. Wires up the
 * starfield, event delegation, and decides what the very first screen
 * should be (a shared card via ?card=CODE in the URL, or the welcome
 * fork otherwise).
 */

import { debounce } from './utils.js';
import { render, buildStars } from './view.js';
import { bindAppEvents, openByCode } from './actions.js';
import { readCardFromLink } from './link.js';
import { state } from './state.js';

async function init() {
  buildStars();
  window.addEventListener('resize', debounce(buildStars, 400));

  const app = document.getElementById('app');
  bindAppEvents(app);

  // 1. A self-contained link (#d=...) works with zero network calls, on any device.
  const linkCard = readCardFromLink();
  if (linkCard) {
    state.card = { id: null, selectedTemplateIdx: null, ...linkCard };
    state.mode = 'recipient';
    state.recipientView = 'envelope';
    render();
    return;
  }

  // 2. Fall back to the older short-code lookup (?card=CODE), which depends on
  //    shared storage and so only works within the same browser/session unless
  //    a real backend has been wired into storage.js.
  let codeFromUrl = null;
  try {
    codeFromUrl = new URLSearchParams(window.location.search).get('card');
  } catch (e) {
    codeFromUrl = null;
  }

  if (codeFromUrl) {
    await openByCode(codeFromUrl.toUpperCase());
  } else {
    render();
  }
}

init();
