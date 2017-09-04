require("../styles/styles.css");
const Osc3x = require("./3xosc");
const {drawOscilloscope, draw3xOsc} = require("./visualize");
const {setupController} = require("./controller");

const audioContext = new AudioContext();

const analyser = audioContext.createAnalyser();
analyser.fftSize = 1024;
analyser.connect(audioContext.destination);

const oscillator = new Osc3x(audioContext, analyser);
oscillator.osc1 = {type: "sawtooth"};
oscillator.osc2 = {type: "square"};
oscillator.osc3 = {type: "sine"};

const canvas = document.querySelector("canvas");
const canvasContext = canvas.getContext("2d");

drawOscilloscope(canvas, canvasContext, analyser);
document.querySelector("img").src = draw3xOsc(oscillator);
setupController(oscillator);
