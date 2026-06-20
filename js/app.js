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

async function init() {
  buildStars();
  window.addEventListener('resize', debounce(buildStars, 400));

  const app = document.getElementById('app');
  bindAppEvents(app);

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
