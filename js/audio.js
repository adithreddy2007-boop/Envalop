/**
 * audio.js
 * Handles the one optional voice note per card: recording via
 * MediaRecorder (max 60s) and playback via a single shared <audio>
 * element. Keeping this in its own module means the rest of the app
 * never has to know how recording actually works.
 */

import { state } from './state.js';
import { formatTime } from './utils.js';
import { blobToDataURL } from './utils.js';
import { render } from './view.js';

const MAX_SECONDS = 60;

export async function startRecording() {
  const errBox = document.getElementById('micError');
  if (errBox) errBox.innerHTML = '';

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (errBox) {
      errBox.innerHTML = '<div class="mic-error">This browser doesn\'t support microphone recording.</div>';
    }
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.recording.stream = stream;

    const recorder = new MediaRecorder(stream);
    state.recording.recorder = recorder;
    state.recording.chunks = [];
    state.recording.seconds = 0;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) state.recording.chunks.push(e.data);
    };

    recorder.onstop = async () => {
      try {
        const blob = new Blob(state.recording.chunks, { type: recorder.mimeType || 'audio/webm' });
        state.card.voice = await blobToDataURL(blob);
        state.card.voiceDuration = state.recording.seconds;
      } catch (e) {
        /* ignore — voice note is optional */
      }
      stream.getTracks().forEach((track) => track.stop());
      state.recording.active = false;
      render();
    };

    recorder.start();
    state.recording.active = true;
    render();

    state.recording.timer = setInterval(() => {
      state.recording.seconds++;
      const timerEl = document.getElementById('recTimer');
      if (timerEl) timerEl.textContent = `${formatTime(state.recording.seconds)} / 1:00`;
      if (state.recording.seconds >= MAX_SECONDS) stopRecording();
    }, 1000);
  } catch (err) {
    if (errBox) {
      errBox.innerHTML = '<div class="mic-error">Microphone access was blocked. Check your browser permissions to record a voice note.</div>';
    }
  }
}

export function stopRecording() {
  if (state.recording.timer) {
    clearInterval(state.recording.timer);
    state.recording.timer = null;
  }
  if (state.recording.recorder && state.recording.recorder.state !== 'inactive') {
    state.recording.recorder.stop();
  }
}

export function toggleAudioPlayback() {
  if (!state.card.voice) return;
  if (!state.audioPlayer) {
    state.audioPlayer = new Audio();
    state.audioPlayer.addEventListener('ended', () => setPlayButtonsState(false));
  }
  if (state.audioPlayer.src !== state.card.voice) state.audioPlayer.src = state.card.voice;

  if (state.audioPlayer.paused) {
    state.audioPlayer.play().catch(() => {});
    setPlayButtonsState(true);
  } else {
    state.audioPlayer.pause();
    setPlayButtonsState(false);
  }
}

function setPlayButtonsState(playing) {
  document.querySelectorAll('[data-action="togglePlay"]').forEach((btn) => {
    btn.textContent = playing ? '⏸' : '▶';
  });
  const bars = document.getElementById('voiceBars');
  if (bars) bars.classList.toggle('playing', playing);
}
