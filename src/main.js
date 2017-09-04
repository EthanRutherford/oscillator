const {j, Controller} = require("jenny-js");
require("../styles/styles.css");
const Osc3x = require("./3xosc");
const {drawOscilloscope, draw3xOsc} = require("./visualize");
const Keyboard = require("./keyboard");

const audioContext = new AudioContext();

class App extends Controller {
	init() {
		this.analyser = audioContext.createAnalyser();
		this.analyser.fftSize = 1024;
		this.analyser.connect(audioContext.destination);

		this.oscillator = new Osc3x(audioContext, this.analyser);
		this.oscillator.osc1 = {type: "sawtooth"};
		this.oscillator.osc2 = {type: "square"};
		this.oscillator.osc3 = {type: "sine"};

		return j({div: 0}, [
			j({canvas: {
				class: "oscilloscope",
				width: 800,
				height: 100,
				ref: (ref) => this.canvas = ref,
			}}),
			//TODO: replace with editor
			j({img: {
				class: "waveform",
				ref: (ref) => this.image = ref,
			}}),
			j([Keyboard, {oscillator: this.oscillator}]),
		]);
	}
	didMount() {
		const canvasContext = this.canvas.getContext("2d");

		drawOscilloscope(this.canvas, canvasContext, this.analyser);

		//TODO: remove
		this.image.src = draw3xOsc(this.oscillator);
	}
}

document.body.content = [j([App])];
