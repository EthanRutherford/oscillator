const {Component} = require("react");
const {render} = require("react-dom");
const j = require("react-jenny");
require("../styles/styles.css");
const Osc3x = require("./3xosc");
const {drawOscilloscope, draw3xOsc} = require("./visualize");
const Keyboard = require("./keyboard");

const audioContext = new AudioContext();

class App extends Component {
	constructor(...args) {
		super(...args);

		this.analyser = audioContext.createAnalyser();
		this.analyser.fftSize = 1024;
		this.analyser.connect(audioContext.destination);

		this.oscillator = new Osc3x(audioContext, this.analyser);
		this.oscillator.osc1 = {type: "sawtooth"};
		this.oscillator.osc2 = {type: "square"};
		this.oscillator.osc3 = {type: "sine"};
	}
	componentDidMount() {
		const canvasContext = this.canvas.getContext("2d");

		drawOscilloscope(this.canvas, canvasContext, this.analyser);

		//TODO: remove
		this.image.src = draw3xOsc(this.oscillator);
	}
	render() {
		return j("div", [
			j({canvas: {
				className: "oscilloscope",
				width: 800,
				height: 100,
				ref: (ref) => this.canvas = ref,
			}}),
			//TODO: replace with editor
			j({img: {
				className: "waveform",
				ref: (ref) => this.image = ref,
			}}),
			j([Keyboard, {oscillator: this.oscillator}]),
		]);
	}
}

render(j(App), document.getElementById("react-root"));
