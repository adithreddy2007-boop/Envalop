/**
 * screens.js
 * Pure "template" layer: every function here reads `state` and returns
 * an HTML string for one screen. Nothing in this file mutates state or
 * touches the DOM directly — that's view.js's job. Keeping templates
 * pure makes the flow easy to follow top to bottom.
 */

import { VIBES, RELATIONSHIPS } from './data.js';
import { state } from './state.js';
import { escapeHtml, formatTime, substituteName, isLocalOrigin } from './utils.js';
import { buildShareLink } from './link.js';
import { storageMode } from './storage.js';
import { OPEN_PAGE_URL } from './firebase-config.js';

/* ---------------------------------------------------------------- */
/* Step 0 — Welcome fork                                             */
/* ---------------------------------------------------------------- */
export function screenWelcome() {
  const notice = state.landingNotice;
  state.landingNotice = null;
  return `
    ${notice ? `<div class="inline-notice">${escapeHtml(notice)}</div>` : ''}
    <div class="eyebrow">✦ Dearly</div>
    <h1 class="title">Is this for someone else —<br>or did someone send you one?</h1>
    <p class="subtitle">Pick one to get started.</p>
    <div class="option-list">
      <button class="option-card surface" data-action="goCreate">
        <span class="icon">💌</span>
        <span class="text"><strong>Create a card</strong><span>Write something for someone</span></span>
      </button>
      <button class="option-card surface" data-action="goReceive">
        <span class="icon">🎁</span>
        <span class="text"><strong>I have a card to open</strong><span>Enter the code you were sent</span></span>
      </button>
    </div>
  `;
}

export function screenReceiveCode() {
  return `
    <div class="topbar">
      <button class="back-link" data-action="toWelcome">← Back</button><span></span>
    </div>
    <div class="eyebrow">✦ Welcome back</div>
    <h1 class="title">Enter your code</h1>
    <p class="subtitle">It's the 6-character code that came with your card.</p>
    <input type="text" id="codeInput2" placeholder="ABC123" maxlength="8"
      style="text-align:center; letter-spacing:.12em; text-transform:uppercase;">
    <div style="height:14px"></div>
    <button class="btn btn-primary" data-action="openCode2">Open my card <span>→</span></button>
    <div id="receiveError"></div>
    <p class="link-note">Got a link instead? Just open it directly — it loads the card automatically.</p>
  `;
}

/* ---------------------------------------------------------------- */
/* Step 1 — Sender's name                                            */
/* ---------------------------------------------------------------- */
export function screenSenderName() {
  return `
    <div class="topbar">
      <button class="back-link" data-action="toWelcome">← Back</button><span></span>
    </div>
    <div class="eyebrow">✦ Step 1</div>
    <h1 class="title">What's your name?</h1>
    <p class="subtitle">So whoever receives this knows it's from you.</p>
    <label class="field-label" for="senderNameInput">Your name</label>
    <input type="text" id="senderNameInput" data-bind="senderName" placeholder="Your first name"
      value="${escapeHtml(state.card.senderName)}" maxlength="24">
    <div style="height:14px"></div>
    <button class="btn btn-primary" data-action="toRecipientName">Go to Next <span>→</span></button>
  `;
}

/* ---------------------------------------------------------------- */
/* Step 2 — Recipient's name                                         */
/* ---------------------------------------------------------------- */
export function screenRecipientName() {
  return `
    <div class="topbar">
      <button class="back-link" data-action="toSenderName">← Back</button><span></span>
    </div>
    <div class="eyebrow">✦ Step 2</div>
    <h1 class="title">Say it properly —<br>not just "thinking of you."</h1>
    <p class="subtitle">A card with a real message, your photos, and your voice.</p>
    <div class="orb-cluster">
      <div class="mini-orb o1">💛</div>
      <div class="mini-orb o2">🌸</div>
      <div class="mini-orb ocenter">✨</div>
      <div class="mini-orb o3">🕊️</div>
      <div class="mini-orb o4">🌙</div>
    </div>
    <label class="field-label" for="nameInput">Who's this for?</label>
    <input type="text" id="nameInput" data-bind="name" placeholder="First name only — Priya, Aryan, Mom…"
      value="${escapeHtml(state.card.name)}" maxlength="24">
    <div style="height:14px"></div>
    <button class="btn btn-primary" data-action="toVibe">Start Writing <span>→</span></button>
  `;
}

/* ---------------------------------------------------------------- */
/* Step 3 — Vibe                                                     */
/* ---------------------------------------------------------------- */
export function screenVibe() {
  const opts = Object.entries(VIBES).map(([key, v]) => `
    <button class="option-card surface" data-action="selectVibe" data-vibe="${key}">
      <span class="icon">${v.emoji}</span>
      <span class="text"><strong>${v.label}</strong><span>${v.blurb}</span></span>
    </button>`).join('');
  return `
    <div class="topbar">
      <button class="back-link" data-action="toRecipientName">← Back</button>
      <div class="step-dots"><span class="dot active"></span><span class="dot"></span><span class="dot"></span></div>
    </div>
    <h1 class="title">What's the vibe for ${escapeHtml(state.card.name) || 'them'}?</h1>
    <p class="subtitle">Pick one — we'll help you write it.</p>
    <div class="option-list">${opts}</div>
  `;
}

/* ---------------------------------------------------------------- */
/* Step 4 — Relationship                                             */
/* ---------------------------------------------------------------- */
export function screenRelationship() {
  const opts = Object.entries(RELATIONSHIPS).map(([key, r]) => `
    <button class="rel-card surface" data-action="selectRel" data-rel="${key}">
      <span class="icon">${r.emoji}</span>
      <strong>${r.label}</strong>
      <span>${r.sub}</span>
    </button>`).join('');
  return `
    <div class="topbar">
      <button class="back-link" data-action="toVibe">← Back</button>
      <div class="step-dots"><span class="dot done"></span><span class="dot active"></span><span class="dot"></span></div>
    </div>
    <h1 class="title">Who is ${escapeHtml(state.card.name) || 'this'} to you?</h1>
    <p class="subtitle">We'll tune the words to match.</p>
    <div class="rel-grid">${opts}</div>
  `;
}

/* ---------------------------------------------------------------- */
/* Step 5 — Message, photos, voice                                   */
/* ---------------------------------------------------------------- */
function getTemplates() {
  const vibe = VIBES[state.card.vibe];
  const rel  = RELATIONSHIPS[state.card.relationship];
  const key  = (rel && rel.templateKey) || 'friend';
  return vibe.templates[key] || vibe.templates.friend;
}

function templateButtonsHtml() {
  const vibe      = VIBES[state.card.vibe];
  const templates = getTemplates();
  return templates.map((t, i) => {
    const selected = state.card.selectedTemplateIdx === i;
    return `<button class="template-card surface ${selected ? 'selected' : ''}" data-action="selectTemplate" data-idx="${i}">
      <span class="tag">${vibe.emoji} Option ${i + 1}</span>${escapeHtml(substituteName(t, state.card.name))}
    </button>`;
  }).join('');
}

export function screenMessage() {
  const vibe = VIBES[state.card.vibe];
  const rel = RELATIONSHIPS[state.card.relationship];

  const photosHtml = state.card.photos.map((p, i) => `
    <div class="photo-thumb"><img src="${p}"><button class="rm" data-action="removePhoto" data-idx="${i}">✕</button></div>
  `).join('');
  const addTile = state.card.photos.length < 3 ? `
    <label class="photo-add">
      <span class="plus">+</span><span>Add</span>
      <input type="file" accept="image/*" id="photoInput" style="display:none">
    </label>` : '';

  let voiceHtml;
  if (state.recording.active) {
    voiceHtml = `
      <div class="voice-box surface">
        <button class="mic-btn recording" data-action="stopRecording">⏹</button>
        <div class="voice-meta"><strong>Recording…</strong><span id="recTimer">0:00 / 1:00</span></div>
      </div>`;
  } else if (state.card.voice) {
    voiceHtml = `
      <div class="voice-box surface">
        <button class="player-btn" data-action="togglePlay" style="width:48px;height:48px;font-size:1.1rem;">▶</button>
        <div class="voice-meta"><strong>Your voice note</strong><span>${formatTime(state.card.voiceDuration)}</span></div>
        <button class="icon-btn" data-action="reRecord" title="Re-record">↻</button>
      </div>`;
  } else {
    voiceHtml = `
      <div class="voice-box surface">
        <button class="mic-btn" data-action="startRecording">🎙</button>
        <div class="voice-meta"><strong>Add a voice note</strong><span>Optional · up to 1, 60s max</span></div>
      </div>`;
  }

  return `
    <div class="topbar">
      <button class="back-link" data-action="toRelationship">← Back</button>
      <div class="step-dots"><span class="dot done"></span><span class="dot done"></span><span class="dot active"></span></div>
    </div>
    <h1 class="title" id="msgScreenTitle">Write it for ${escapeHtml(state.card.name)}</h1>
    <p class="subtitle">Confirm the display name, pick a starting point, then make it yours.</p>

    <label class="field-label" for="nameInput">What name should it display?</label>
    <input type="text" id="nameInput" data-bind="name" placeholder="Their display name" value="${escapeHtml(state.card.name)}" maxlength="24">

    <label class="field-label" id="chooseMessageLabel">Choose a message — written for ${escapeHtml(state.card.name) || 'them'}</label>
    <div class="template-scroll">${templateButtonsHtml()}</div>

    <label class="field-label" for="msgInput">Your message</label>
    <textarea id="msgInput" data-bind="message" maxlength="320" placeholder="Write something real…">${escapeHtml(state.card.message)}</textarea>
    <div class="char-count"><span id="charCount">${state.card.message.length}</span>/320</div>

    <label class="field-label">Add photos <span style="color:var(--muted); font-weight:400;">(up to 3, optional)</span></label>
    <div class="photo-row">${photosHtml}${addTile}</div>
    <div class="photo-hint">${state.photoErrorMsg ? escapeHtml(state.photoErrorMsg) : "JPEG, PNG or WebP · we'll resize automatically"}</div>

    <label class="field-label">Add a voice note <span style="color:var(--muted); font-weight:400;">(optional)</span></label>
    ${voiceHtml}
    <div id="micError"></div>

    <div style="height:10px"></div>
    <button class="btn btn-primary" id="generateBtn" data-action="generateCard">Generate my card 💌</button>
    <div id="generateError"></div>
  `;
}

/* ---------------------------------------------------------------- */
/* Step 6 — Share                                                    */
/* ---------------------------------------------------------------- */
export function screenShare() {
  const cloudReady = storageMode !== 'local-browser';

  const localWarning = isLocalOrigin() ? `
    <div class="inline-notice">⚠️ You're on a local address (${escapeHtml(window.location.hostname || 'file://')}) —
    this code will only work on this computer. Deploy to GitHub Pages first.</div>` : '';

  const setupNudge = (!cloudReady && !isLocalOrigin()) ? `
    <div class="inline-notice">💡 Firebase not connected yet — see README to enable cross-device codes.</div>` : '';

  return `
    <div class="share-hero">
      <div class="confetti-wrap" id="confettiWrap"></div>
      <div class="seal">${VIBES[state.card.vibe].emoji}</div>
      <div class="eyebrow">Card ready</div>
      <h1 class="title">It's ready for ${escapeHtml(state.card.name)}.</h1>
      <p class="subtitle">Send them this code, then share the link to the card opener.</p>
    </div>

    ${localWarning}
    ${setupNudge}

    <div class="code-display surface">
      <span class="code-label">Their code</span>
      <span class="code-value" id="shareCodeValue">${state.card.id}</span>
    </div>

    <div style="height:16px"></div>
    <button class="btn btn-primary" data-action="copyLinkAndCode">
      Copy link + code 🔗
    </button>
    <p class="link-note">Copies the card opener link and the code together — just paste it into WhatsApp or a message.</p>

    <div class="share-actions">
      <button class="btn btn-ghost" data-action="previewCard">Preview as ${escapeHtml(state.card.name)}</button>
      <button class="btn-text" data-action="makeAnother" style="margin:0 auto; display:block;">Make another card</button>
      <button class="btn btn-ghost home-btn" data-action="goHome">🏠 Home</button>
    </div>
  `;
}

/* ---------------------------------------------------------------- */
/* Recipient — Envelope                                              */
/* ---------------------------------------------------------------- */
export function screenEnvelope() {
  const vibe = VIBES[state.card.vibe];
  const rel = RELATIONSHIPS[state.card.relationship] || { eyebrowSmall: 'A card for you' };
  return `
    <div class="envelope-wrap">
      <div class="eyebrow">✦ ${rel.eyebrowSmall}</div>
      <div class="script-line">${escapeHtml(vibe.envelopeTitle)}</div>
      <div class="envelope-stage" id="envelopeStage">
        <div class="envelope-flower">${vibe.motif}</div>
        <div class="envelope-body"><div class="envelope-to">To ${escapeHtml(state.card.name)}</div></div>
        <div class="envelope-flap"></div>
        <div class="envelope-seal">${vibe.emoji}</div>
      </div>
      <div class="slide-track" id="slideTrack">
        <div class="slide-fill" id="slideFill"></div>
        <div class="slide-label">Slide to open <span>→</span></div>
        <div class="slide-knob" id="slideKnob">${vibe.motif}</div>
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------- */
/* Recipient — Orb reveal (uses the first photo, if any)             */
/* ---------------------------------------------------------------- */
export function screenOrbs() {
  const vibe = VIBES[state.card.vibe];
  const blurLevels = [18, 13, 8, 3, 0];
  const blur = blurLevels[state.orb.count];
  const quoteText = vibe.orbLines[Math.max(0, Math.min(state.orb.count - 1, 3))] || vibe.orbLines[0];
  const photoSrc = state.card.photos[0] || null;
  const icons = ['💛', '✨', '🌸', '🕊️'];
  const positions = ['p1', 'p2', 'p3', 'p4'];

  const orbsHtml = [0, 1, 2, 3].map((i) => {
    if (state.orb.tapped[i]) return `<button class="orb tapped ${positions[i]}" data-idx="${i}">${icons[i]}</button>`;
    return `<button class="orb ${positions[i]}" data-action="tapOrb" data-idx="${i}">${icons[i]}</button>`;
  }).join('');

  return `
    <div class="quote-box surface"><span class="quote-emoji">${vibe.emoji}</span><span id="quoteText">"${escapeHtml(quoteText)}"</span></div>
    <div class="porthole-wrap">
      <div class="porthole">
        ${photoSrc
          ? `<img src="${photoSrc}" id="portholeImg" style="filter:blur(${blur}px) brightness(.85);">`
          : `<div class="placeholder" id="portholeImg" style="filter:blur(${blur}px);">${vibe.motif}</div>`}
      </div>
      <div class="orbit-layer">${orbsHtml}</div>
    </div>
    <div class="orb-progress">Tap the orbs! (${state.orb.count} / 4)</div>
    <button class="btn btn-primary" id="orbContinueBtn" data-action="toPhotos"
      style="opacity:${state.orb.count >= 4 ? 1 : 0}; pointer-events:${state.orb.count >= 4 ? 'auto' : 'none'}; transition:opacity .3s;">
      Continue <span>→</span>
    </button>
  `;
}

/* ---------------------------------------------------------------- */
/* Recipient — Remaining photos + voice note                         */
/* (photo[0] was already shown inside the orb reveal, so this screen */
/*  shows whatever's left: photo[1] and photo[2].)                   */
/* ---------------------------------------------------------------- */
export function screenPhotos() {
  const vibe = VIBES[state.card.vibe];
  const remainingPhotos = state.card.photos.slice(1, 3);
  const photosHtml = remainingPhotos.length
    ? `<div class="polaroid-row">${remainingPhotos.map((p) => `<div class="polaroid"><img src="${p}"></div>`).join('')}</div>`
    : '';
  const voiceHtml = state.card.voice ? `
    <div class="player-box surface">
      <button class="player-btn" data-action="togglePlay">▶</button>
      <div class="voice-meta"><strong>Voice note</strong><span>${formatTime(state.card.voiceDuration)}</span></div>
      <div class="bars" id="voiceBars"><span></span><span></span><span></span><span></span><span></span></div>
    </div>` : '';
  const emptyState = (!remainingPhotos.length && !state.card.voice) ? `<div class="empty-soft">✦ ✦ ✦</div>` : '';

  return `
    <div class="eyebrow">${vibe.emoji} A little more</div>
    <h1 class="title">${escapeHtml(vibe.photoHeadline)}</h1>
    ${photosHtml}
    ${voiceHtml}
    ${emptyState}
    <div style="height:18px"></div>
    <button class="btn btn-primary" data-action="toFinal">Next <span>→</span></button>
  `;
}

/* ---------------------------------------------------------------- */
/* Recipient — Final card                                            */
/* ---------------------------------------------------------------- */
export function screenFinal() {
  const rel = RELATIONSHIPS[state.card.relationship] || { eyebrow: 'TO YOU' };
  const signature = state.card.senderName
    ? `with love, ${escapeHtml(state.card.senderName)}`
    : 'made with love · Dearly';
  return `
    <div class="final-card">
      <span class="corner tl">✦</span><span class="corner tr">🤍</span>
      <div class="eyebrow">${rel.eyebrow}</div>
      <div class="final-name">${escapeHtml(state.card.name)} ❤️</div>
      <p class="final-message">"${escapeHtml(state.card.message)}"</p>
      <div class="final-footer">~ ✦ ~<br>${signature}</div>
      <span class="corner bl">🤍</span><span class="corner br">🌙</span>
    </div>
    <button class="btn btn-ghost home-btn" data-action="goHome">🏠 Home</button>
  `;
}
