"use strict";

(() => {
  if (window.__thalvrixAudioEngine) return;
  window.__thalvrixAudioEngine = true;

  const state = {
    enabled: true, input: 1, output: 0.85,
    bass: 0, mid: 0, treble: 0, clarity: 0, presence: 0,
    compressor: 0, saturation: 0, distortion: 0,
    reverb: 0, echo: 0, stereoWidth: 0, haas: 0, pan: 0,
    robot: 0, deep: 0, radio: 0, alien: 0
  };

  let ctx = null, inputGain, masterGain, bassFilter, midFilter, trebleFilter;
  let clarityFilter, presenceFilter, compressor, saturation, distortion;
  let delay, delayFeedback, echoGain, convolver, reverbGain, stereoDelay;
  let leftGain, rightGain, merger, limiter, analyser, robotOsc, robotGain;

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function createAudioGraph(stream) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContextClass({ latencyHint: "interactive", sampleRate: 48000 });

    const source = ctx.createMediaStreamSource(stream);
    inputGain = ctx.createGain();
    bassFilter = ctx.createBiquadFilter(); bassFilter.type = "lowshelf"; bassFilter.frequency.value = 150;
    trebleFilter = ctx.createBiquadFilter(); trebleFilter.type = "highshelf"; trebleFilter.frequency.value = 5000;
    masterGain = ctx.createGain();

    source.connect(inputGain);
    inputGain.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(masterGain);

    const destination = ctx.createMediaStreamDestination();
    masterGain.connect(destination);

    applyEffects();
    return destination.stream;
  }

  function applyEffects() {
    if (!ctx) return;
    const now = ctx.currentTime;
    inputGain.gain.setTargetAtTime(state.enabled ? clamp(state.input, 0, 2) : 0, now, 0.025);
    masterGain.gain.setTargetAtTime(clamp(state.output, 0, 1), now, 0.025);
    bassFilter.gain.setTargetAtTime(state.bass, now, 0.03);
    trebleFilter.gain.setTargetAtTime(state.treble, now, 0.03);
  }

  // Popup থেকে আসা মেসেজ গ্রহণ করা
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "THALVRIX_UPDATE") {
      state[event.data.key] = event.data.value;
      applyEffects();
    }
  });

  function hookMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) return;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

    navigator.mediaDevices.getUserMedia = async function (constraints) {
      if (!constraints?.audio) return original(constraints);
      try {
        const inputStream = await original({ ...constraints, audio: { echoCancellation: false, noiseSuppression: false } });
        return createAudioGraph(inputStream);
      } catch (e) {
        return original(constraints);
      }
    };
  }

  hookMicrophone();
})();
