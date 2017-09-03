require("../styles/styles.css");
const Osc3x = require("./3xosc");
const {toUnModified, toneFromKey} = require("./keyboard");
const {drawOscilloscope, draw3xOsc} = require("./visualize");
const {setup, startKey, stopKey} = require("./controller");

const audioContext = new AudioContext();

const analyser = audioContext.createAnalyser();
analyser.fftSize = 1024;
analyser.connect(audioContext.destination);

const oscillator = new Osc3x(audioContext, analyser);
oscillator.osc1 = {type: "sawtooth"};
oscillator.osc2 = {type: "square"};
oscillator.osc3 = {type: "sine"};

const keys = {};

window.addEventListener("keydown", (event) => {
	const key = toUnModified(event.key);
	const tone = toneFromKey(key);
	if (tone) {
		event.preventDefault();
		oscillator.startNote(tone.note, tone.octave);
		startKey(key);
		keys[key] = tone;
	}
});

window.addEventListener("keyup", (event) => {
	const key = toUnModified(event.key);
	const tone = keys[key];
	if (tone) {
		event.preventDefault();
		oscillator.stopNote(tone.note, tone.octave);
		stopKey(key);
		keys[key] = null;
	}
});

const canvas = document.querySelector("canvas");
const canvasContext = canvas.getContext("2d");

drawOscilloscope(canvas, canvasContext, analyser);
document.querySelector("img").src = draw3xOsc(oscillator);
setup();
