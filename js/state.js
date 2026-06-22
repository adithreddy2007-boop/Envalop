/**
 * state.js
 * Single source of truth for everything that changes while the app runs.
 * Other modules import `state` and mutate its fields directly, then call
 * view.render() to reflect the change — a deliberately small, simple
 * pattern that doesn't need a framework for an app this size.
 */

export function emptyCard() {
  return {
    id: null,
    senderName: '',
    name: '',              // recipient / display name
    vibe: null,
    relationship: null,
    message: '',
    selectedTemplateIdx: null,
    photos: [],            // data URLs, up to 3
    voice: null,            // data URL, at most 1 recording
    voiceDuration: 0
  };
}

export const state = {
  card: emptyCard(),

  mode: 'create',                // 'create' | 'recipient'
  creatorStep: 'welcome',        // welcome -> senderName -> recipientName -> vibe -> relationship -> message -> share
                                  // (or welcome -> receiveCode)
  recipientView: null,           // envelope -> orbs -> photos -> final

  landingNotice: null,
  photoErrorMsg: null,

  orb: { tapped: [false, false, false, false], count: 0, autoAdvanceTimer: null },

  recording: { active: false, recorder: null, chunks: [], stream: null, timer: null, seconds: 0 },
  audioPlayer: null,

  confettiPlayed: false
};

/** Resets card data and returns to a given creator step (default: the welcome fork). */
export function resetState(creatorStep = 'welcome') {
  state.card = emptyCard();
  state.mode = 'create';
  state.creatorStep = creatorStep;
  state.recipientView = null;
  state.landingNotice = null;
  state.photoErrorMsg = null;
  state.orb = { tapped: [false, false, false, false], count: 0, autoAdvanceTimer: null };
  state.confettiPlayed = false;
}
