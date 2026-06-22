/**
 * view.js
 * The only module that touches the DOM for rendering. It turns the
 * current `state` into markup (via screens.js) and wires up the bits
 * of interactivity that need real DOM elements — dragging the envelope
 * knob, tapping orbs, the confetti burst, the background starfield.
 */

import { state } from './state.js';
import { VIBES } from './data.js';
import { escapeHtml, substituteName } from './utils.js';
import * as screens from './screens.js';

/* ---------------------------------------------------------------- */
/* Render                                                            */
/* ---------------------------------------------------------------- */
export function render() {
  const stage = document.getElementById('stage');
  let html = '';

  if (state.mode === 'create') {
    switch (state.creatorStep) {
      case 'welcome': html = screens.screenWelcome(); break;
      case 'receiveCode': html = screens.screenReceiveCode(); break;
      case 'senderName': html = screens.screenSenderName(); break;
      case 'recipientName': html = screens.screenRecipientName(); break;
      case 'vibe': html = screens.screenVibe(); break;
      case 'relationship': html = screens.screenRelationship(); break;
      case 'message': html = screens.screenMessage(); break;
      case 'share': html = screens.screenShare(); break;
      default: html = screens.screenWelcome();
    }
  } else {
    switch (state.recipientView) {
      case 'envelope': html = screens.screenEnvelope(); break;
      case 'orbs': html = screens.screenOrbs(); break;
      case 'photos': html = screens.screenPhotos(); break;
      case 'final': html = screens.screenFinal(); break;
      default: html = screens.screenEnvelope();
    }
  }

  stage.innerHTML = html;
  stage.classList.remove('enter');
  void stage.offsetWidth; // force reflow so the animation restarts on every render
  stage.classList.add('enter');
  afterRender();
}

function afterRender() {
  if (state.mode === 'recipient' && state.recipientView === 'envelope') wireSlide();
  if (state.mode === 'create' && state.creatorStep === 'share' && !state.confettiPlayed) {
    spawnConfetti();
    state.confettiPlayed = true;
  }
}

/* ---------------------------------------------------------------- */
/* Starfield background                                              */
/* ---------------------------------------------------------------- */
function starShadow(n, w, h) {
  const dots = [];
  for (let i = 0; i < n; i++) dots.push(`${(Math.random() * w) | 0}px ${(Math.random() * h) | 0}px #fff`);
  return dots.join(',');
}

export function buildStars() {
  const w = Math.max(window.innerWidth, 400);
  const h = Math.max(window.innerHeight, 700);
  const small = document.getElementById('starsSmall');
  const big = document.getElementById('starsBig');
  if (small) { small.style.width = '1px'; small.style.height = '1px'; small.style.boxShadow = starShadow(130, w, h); }
  if (big) { big.style.width = '2px'; big.style.height = '2px'; big.style.boxShadow = starShadow(45, w, h); }
}

/* ---------------------------------------------------------------- */
/* Small field-level helpers                                         */
/* ---------------------------------------------------------------- */
export function flashFieldError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#D4536B';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; }, 900);
}

/** Live-updates the message-step UI when the display name changes, without a full re-render (keeps input focus). */
export function refreshNameDependentUI() {
  if (state.creatorStep !== 'message') return;
  const vibe = VIBES[state.card.vibe];
  if (!vibe) return;

  const rel       = RELATIONSHIPS[state.card.relationship];
  const key       = (rel && rel.templateKey) || 'friend';
  const templates = vibe.templates[key] || vibe.templates.friend;

  const scroll = document.querySelector('.template-scroll');
  if (scroll) {
    scroll.innerHTML = templates.map((t, i) => {
      const selected = state.card.selectedTemplateIdx === i;
      return `<button class="template-card surface ${selected ? 'selected' : ''}" data-action="selectTemplate" data-idx="${i}">
        <span class="tag">${vibe.emoji} Option ${i + 1}</span>${escapeHtml(substituteName(t, state.card.name))}
      </button>`;
    }).join('');
  }

  const title = document.getElementById('msgScreenTitle');
  if (title) title.textContent = `Write it for ${(state.card.name || '').trim() || 'them'}`;

  const label = document.getElementById('chooseMessageLabel');
  if (label) label.textContent = `Choose a message — written for ${(state.card.name || '').trim() || 'them'}`;
}

/* ---------------------------------------------------------------- */
/* Confetti (share screen, once)                                     */
/* ---------------------------------------------------------------- */
function spawnConfetti() {
  const wrap = document.getElementById('confettiWrap');
  if (!wrap) return;
  const bits = ['✦', '🌸', '✨', '🤍', '🌟'];
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('span');
    s.className = 'confetti';
    s.textContent = bits[Math.floor(Math.random() * bits.length)];
    s.style.left = `${Math.random() * 92}%`;
    s.style.animationDelay = `${Math.random() * 0.4}s`;
    s.style.color = Math.random() > 0.5 ? '#E8C16B' : '#D4536B';
    wrap.appendChild(s);
    setTimeout(() => { if (s.parentNode) s.parentNode.removeChild(s); }, 2200);
  }
}

/* ---------------------------------------------------------------- */
/* Envelope slide-to-open                                            */
/* ---------------------------------------------------------------- */
function wireSlide() {
  const track = document.getElementById('slideTrack');
  if (!track) return;
  const knob = document.getElementById('slideKnob');
  const fill = document.getElementById('slideFill');
  let dragging = false;
  let startX = 0;
  let knobStartLeft = 4;

  const maxLeft = () => Math.max(track.clientWidth - knob.offsetWidth - 8, 10);

  function onDown(e) {
    dragging = true;
    knob.classList.add('dragging');
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    knobStartLeft = parseFloat(knob.style.left || '4');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }
  function onMove(e) {
    if (!dragging) return;
    if (e.cancelable) e.preventDefault();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const left = Math.min(Math.max(knobStartLeft + (x - startX), 4), maxLeft());
    knob.style.left = `${left}px`;
    fill.style.width = `${(left / maxLeft()) * 100}%`;
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    knob.classList.remove('dragging');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);

    const pct = parseFloat(knob.style.left || '4') / maxLeft();
    if (pct > 0.78) {
      knob.style.left = `${maxLeft()}px`;
      fill.style.width = '100%';
      openEnvelope();
    } else {
      knob.style.left = '4px';
      fill.style.width = '0%';
    }
  }
  knob.addEventListener('mousedown', onDown);
  knob.addEventListener('touchstart', onDown, { passive: true });
}

function openEnvelope() {
  const stageEl = document.getElementById('envelopeStage');
  if (stageEl) stageEl.classList.add('open');
  state.orb = { tapped: [false, false, false, false], count: 0, autoAdvanceTimer: null };
  setTimeout(() => {
    state.recipientView = 'orbs';
    render();
  }, 650);
}

/* ---------------------------------------------------------------- */
/* Orb tap: reveal + matching particle burst                         */
/* ---------------------------------------------------------------- */
function spawnOrbBurst(orbEl, icon) {
  if (!orbEl) return;
  const wrap = document.querySelector('.porthole-wrap');
  if (!wrap) return;
  const wrapRect = wrap.getBoundingClientRect();
  const orbRect = orbEl.getBoundingClientRect();
  const originX = orbRect.left + orbRect.width / 2 - wrapRect.left;
  const originY = orbRect.top + orbRect.height / 2 - wrapRect.top;
  const bit = icon || orbEl.textContent || '✨';
  const count = 10;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'orb-burst';
    p.textContent = bit;
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
    const dist = 36 + Math.random() * 54;
    p.style.left = `${originX}px`;
    p.style.top = `${originY}px`;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist - 14}px`);
    p.style.animationDelay = `${Math.random() * 0.12}s`;
    wrap.appendChild(p);
    setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 1100);
  }
}

export function tapOrb(idx) {
  if (state.orb.tapped[idx]) return;
  state.orb.tapped[idx] = true;
  state.orb.count++;

  const orbEl = document.querySelector(`.orb[data-idx="${idx}"]`);
  const icon = orbEl ? orbEl.textContent : null;
  spawnOrbBurst(orbEl, icon);
  if (orbEl) { orbEl.classList.add('tapped'); orbEl.removeAttribute('data-action'); }

  const vibe = VIBES[state.card.vibe];
  const quoteEl = document.getElementById('quoteText');
  if (quoteEl) quoteEl.textContent = `"${vibe.orbLines[Math.min(state.orb.count - 1, 3)]}"`;

  const blurLevels = [18, 13, 8, 3, 0];
  const img = document.getElementById('portholeImg');
  if (img) img.style.filter = `blur(${blurLevels[state.orb.count]}px) brightness(.85)`;

  const progress = document.querySelector('.orb-progress');
  if (progress) progress.textContent = `Tap the orbs! (${state.orb.count} / 4)`;

  if (state.orb.count >= 4) {
    const continueBtn = document.getElementById('orbContinueBtn');
    if (continueBtn) { continueBtn.style.opacity = '1'; continueBtn.style.pointerEvents = 'auto'; }
    state.orb.autoAdvanceTimer = setTimeout(() => {
      if (state.recipientView === 'orbs') { state.recipientView = 'photos'; render(); }
    }, 1700);
  }
}
