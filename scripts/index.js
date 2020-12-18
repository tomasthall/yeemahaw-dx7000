window.AudioContext = window.AudioContext || window.webkitAudioContext;
let volumeControl = document.querySelector("input[name='volume']");
let wavePickerFirstOscillator = document.querySelector("select[name='waveformFirst']");
let wavePickerSecondOscillator = document.querySelector("select[name='waveformSecond']");
let detuneFirstOscillator = document.querySelector("input[name='detuneFirstOscillator']");
let detuneSecondOscillator = document.querySelector("input[name='detuneSecondOscillator']");
let delayTime = document.querySelector("input[name='delayTime']")
let attack = document.querySelector("input[name='attack']")
let release = document.querySelector("input[name='release']")
let threshold = document.querySelector("input[name='threshold']")
let knee = document.querySelector("input[name='knee']")
let ratio = document.querySelector("input[name='ratio']")
let reduction = document.querySelector("input[name='reduction']")

const context = new AudioContext(),
  settings = {
    id: "keyboard",
    width: 600,
    height: 150,
    startNote: "C3",
    whiteNotesColour: "#fff",
    blackNotesColour: "#000",
    borderColour: "#000",
    activeColour: "lightgray",
    octaves: 2,
  },
  keyboard = new QwertyHancock(settings);

let masterGain = context.createGain();
let nodes = [];
let nodesSecond = [];
let oscillatorTypes = [];

masterGain.gain.value = 0.1;
masterGain.connect(context.destination);

const changeMasterVolume = () => {
  masterGain.gain.value = volumeControl.value;
}

volumeControl.addEventListener("change", changeMasterVolume, false);

// function getPitchShift(sound, ) {
//   const source = context.createBufferSource();
//   source.buffer = sound;
//   source.playbackRate.value = 2 ** ((noteToPlay - sampleNote) / 12);
//   source.playbackRate.value = 2 ** ((noteToPlay - sampleNote) / 12);
//   source.connect(context.destination);
// }

function getCombFilter(audioCtx) {
  const node = audioCtx.createGain();
  const lowPass = new BiquadFilterNode(audioCtx, {type: 'lowpass', frequency: 440});
  const delay = new DelayNode(audioCtx, {delayTime: delayTime.value});
  const gain = audioCtx.createGain();
  const wet = audioCtx.createGain();
  wet.gain.setValueAtTime(100, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
  node.connect(delay).connect(lowPass).connect(gain).connect(node);

  return node;
}

keyboard.keyDown = function (note, frequency) {
  let combFilter = getCombFilter(context);
  let compressor = context.createDynamicsCompressor();
  compressor.attack.setValueAtTime(attack.value, context.currentTime);
  compressor.release.setValueAtTime(release.value, context.currentTime);
  compressor.knee.setValueAtTime(knee.value, context.currentTime);
  compressor.threshold.setValueAtTime(threshold.value, context.currentTime);
  compressor.ratio.setValueAtTime(ratio.value, context.currentTime);


  let oscillator = context.createOscillator();
  oscillator.type = wavePickerFirstOscillator.value;
  oscillator.detune.setValueAtTime(detuneFirstOscillator.value, context.currentTime);
  oscillator.frequency.value = frequency;
  oscillator.connect(compressor).connect(combFilter).connect(masterGain);
  oscillator.start(0);

  let oscillatorSecond = context.createOscillator();
  oscillatorSecond.type = wavePickerSecondOscillator.value;
  oscillatorSecond.detune.setValueAtTime(detuneSecondOscillator.value, context.currentTime);
  oscillatorSecond.frequency.value = frequency;
  oscillatorSecond.connect(compressor).connect(combFilter).connect(masterGain);
  oscillatorSecond.start(0);

  nodes.push(oscillator);
  nodesSecond.push(oscillatorSecond);
};

keyboard.keyUp = function (note, frequency) {
  let new_nodes = [];
  let new_second_nodes = [];

  for (let i = 0; i < nodes.length; i++) {
    if (Math.round(nodes[i].frequency.value) === Math.round(frequency)) {
      nodes[i].stop(0);
      nodes[i].disconnect();
    } else {
      new_nodes.push(nodes[i]);
    }
  }

  for (let i = 0; i < nodesSecond.length; i++) {
    if (Math.round(nodesSecond[i].frequency.value) === Math.round(frequency)) {
      nodesSecond[i].stop(0);
      nodesSecond[i].disconnect();
    } else {
      new_second_nodes.push(nodesSecond[i]);
    }
  }

  nodes = new_nodes;
  nodesSecond = new_second_nodes;
};