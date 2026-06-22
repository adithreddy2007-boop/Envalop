/**
 * actions.js
 * Everything that happens in response to user input lives here: the
 * delegated click/input/change handlers, and the higher-level actions
 * they call (generating a card, copying the code, resetting, etc).
 * This is the only module allowed to both read user input AND mutate
 * `state` AND call `render()` — keeping that combination in one place
 * makes the data flow easy to trace.
 */

import { state, resetState } from './state.js';
import { VIBES, RELATIONSHIPS } from './data.js';
import { substituteName, compressImage } from './utils.js';
import { saveCard, loadCard, generateUniqueCode, storageMode } from './storage.js';
import { buildShareLink } from './link.js';
import { OPEN_PAGE_URL } from './firebase-config.js';
import { startRecording, stopRecording, toggleAudioPlayback } from './audio.js';
import { render, flashFieldError, refreshNameDependentUI, tapOrb } from './view.js';

/* ---------------------------------------------------------------- */
/* Card lifecycle                                                    */
/* ---------------------------------------------------------------- */
async function generateCard() {
  if (!state.card.message.trim()) { flashFieldError('msgInput'); return; }
  if (!state.card.name.trim()) { flashFieldError('nameInput'); return; }

  const btn = document.getElementById('generateBtn');
  const errBox = document.getElementById('generateError');
  if (errBox) errBox.innerHTML = '';
  if (btn) { btn.disabled = true; btn.textContent = 'Generating…'; }

  state.card.id = await generateUniqueCode();
  try {
    await saveCard(state.card);
    state.confettiPlayed = false;
    state.creatorStep = 'share';
    render();
  } catch (err) {
    if (btn) { btn.disabled = false; btn.textContent = 'Generate my card 💌'; }
    if (errBox) {
      errBox.innerHTML = '<div class="mic-error" style="text-align:center;margin-top:10px;">Couldn\'t save your card — check your connection and try again.</div>';
    }
  }
}

async function copyLinkAndCode(btnEl) {
  const code = state.card.id || '';
  const url  = (OPEN_PAGE_URL || '').replace(/\/$/, '');
  const text = `Open your card at: ${url}\nYour code: ${code}`;
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (e) {
    try {
      const temp = document.createElement('input');
      temp.value = text;
      temp.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(temp);
      temp.select();
      ok = document.execCommand('copy');
      document.body.removeChild(temp);
    } catch (e2) { ok = false; }
  }
  if (btnEl) {
    const orig = btnEl.textContent;
    btnEl.textContent = ok ? 'Copied!' : 'Copy failed';
    setTimeout(() => { btnEl.textContent = orig; }, 1800);
  }
}

async function copyShareCode(btnEl) {
  const codeEl = document.getElementById('shareCodeValue');
  if (!codeEl) return;
  const text = codeEl.textContent || '';
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch (e) {
    try {
      const range = document.createRange();
      range.selectNodeContents(codeEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      ok = document.execCommand('copy');
      sel.removeAllRanges();
    } catch (e2) { ok = false; }
  }
  if (btnEl) {
    const original = btnEl.textContent;
    btnEl.textContent = ok ? 'Copied!' : 'Copy failed';
    setTimeout(() => { btnEl.textContent = original; }, 1600);
  }
}

async function openByCode(code, { inline = false } = {}) {
  try {
    const data = await loadCard(code);
    state.card = {
      id: code,
      senderName: data.senderName || '',
      name: data.name || '',
      vibe: data.vibe,
      relationship: data.relationship,
      message: data.message || '',
      photos: data.photos || [],
      voice: data.voice || null,
      voiceDuration: data.voiceDuration || 0,
      selectedTemplateIdx: null
    };
    state.mode = 'recipient';
    state.recipientView = 'envelope';
    render();
    return true;
  } catch (err) {
    if (inline) return false;
    state.landingNotice = "That card link looks expired or invalid — but you can make your own below.";
    state.mode = 'create';
    state.creatorStep = 'welcome';
    render();
    return false;
  }
}

async function handleOpenCodeButton() {
  const input = document.getElementById('codeInput2');
  const code = (input && input.value || '').trim().toUpperCase();
  const errBox = document.getElementById('receiveError');
  if (errBox) errBox.innerHTML = '';
  if (!code) { flashFieldError('codeInput2'); return; }

  const ok = await openByCode(code, { inline: true });
  if (!ok && errBox) {
    errBox.innerHTML = '<div class="mic-error" style="margin-top:10px;">We couldn\'t find a card with that code. Double check it and try again.</div>';
  }
}

/* ---------------------------------------------------------------- */
/* Click delegation                                                  */
/* ---------------------------------------------------------------- */
function onAppClick(e) {
  const t = e.target.closest('[data-action]');
  if (!t) return;
  const action = t.dataset.action;

  switch (action) {
    case 'toWelcome': state.creatorStep = 'welcome'; render(); break;
    case 'goCreate': state.creatorStep = 'senderName'; render(); break;
    case 'goReceive': state.creatorStep = 'receiveCode'; render(); break;
    case 'openCode2': handleOpenCodeButton(); break;

    case 'toSenderName': state.creatorStep = 'senderName'; render(); break;
    case 'toRecipientName':
      state.card.senderName = (state.card.senderName || '').trim();
      state.creatorStep = 'recipientName';
      render();
      break;

    case 'toVibe':
      state.card.name = (state.card.name || '').trim();
      if (!state.card.name) { flashFieldError('nameInput'); return; }
      state.creatorStep = 'vibe';
      render();
      break;

    case 'selectVibe':
      state.card.vibe = t.dataset.vibe;
      state.card.selectedTemplateIdx = null;
      state.card.message = '';
      setTimeout(() => { state.creatorStep = 'relationship'; render(); }, 180);
      break;

    case 'toRelationship': state.creatorStep = 'relationship'; render(); break;
    case 'selectRel':
      state.card.relationship = t.dataset.rel;
      setTimeout(() => { state.creatorStep = 'message'; render(); }, 180);
      break;

    case 'selectTemplate': {
      const idx  = parseInt(t.dataset.idx, 10);
      state.card.selectedTemplateIdx = idx;
      const vibe = VIBES[state.card.vibe];
      const rel  = RELATIONSHIPS[state.card.relationship];
      const key  = (rel && rel.templateKey) || 'friend';
      const pool = vibe.templates[key] || vibe.templates.friend;
      state.card.message = `${substituteName(pool[idx], state.card.name)}\n\n${rel.sign}`;
      render();
      break;
    }

    case 'removePhoto': {
      const idx = parseInt(t.dataset.idx, 10);
      state.card.photos.splice(idx, 1);
      render();
      break;
    }

    case 'startRecording': startRecording(); break;
    case 'stopRecording': stopRecording(); break;
    case 'reRecord': state.card.voice = null; state.card.voiceDuration = 0; render(); break;
    case 'togglePlay': toggleAudioPlayback(); break;

    case 'generateCard': generateCard(); break;
    case 'copyLinkAndCode': copyLinkAndCode(t); break;
    case 'copyCode': copyShareCode(t); break;
    case 'previewCard': state.mode = 'recipient'; state.recipientView = 'envelope'; render(); break;

    case 'makeAnother': resetState('senderName'); render(); break;
    case 'goHome': resetState('welcome'); render(); break;

    case 'tapOrb': tapOrb(parseInt(t.dataset.idx, 10)); break;
    case 'toPhotos':
      if (state.orb.autoAdvanceTimer) clearTimeout(state.orb.autoAdvanceTimer);
      state.recipientView = 'photos';
      render();
      break;
    case 'toFinal': state.recipientView = 'final'; render(); break;
    default: break;
  }
}

/* ---------------------------------------------------------------- */
/* Input / change delegation                                         */
/* ---------------------------------------------------------------- */
function onAppInput(e) {
  const el = e.target;
  if (!el || !el.dataset || !el.dataset.bind) return;

  state.card[el.dataset.bind] = el.value;

  if (el.id === 'msgInput') {
    const counter = document.getElementById('charCount');
    if (counter) counter.textContent = el.value.length;
  }
  if (el.id === 'nameInput' && state.creatorStep === 'message') {
    refreshNameDependentUI();
  }
}

function onAppChange(e) {
  if (!e.target || e.target.id !== 'photoInput') return;
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (state.card.photos.length >= 3) return;

  compressImage(file)
    .then((url) => {
      state.photoErrorMsg = null;
      state.card.photos.push(url);
      render();
    })
    .catch(() => {
      state.photoErrorMsg = "Couldn't read that photo — try a different one.";
      render();
    });
}

/* ---------------------------------------------------------------- */
/* Public entry point                                                */
/* ---------------------------------------------------------------- */
export function bindAppEvents(appEl) {
  appEl.addEventListener('click', onAppClick);
  appEl.addEventListener('input', onAppInput);
  appEl.addEventListener('change', onAppChange);
}

export { openByCode };
