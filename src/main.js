const {Component} = require("react");
const {render} = require("react-dom");
const j = require("react-jenny");
require("../styles/styles.css");
const Osc3x = require("./3xosc");
const {drawOscilloscope} = require("./visualize");
const Keyboard = require("./keyboard");
const OscEditor = require("./osc-editor");

const audioContext = new AudioContext();

class App extends Component {
	constructor(...args) {
		super(...args);

		this.analyser = audioContext.createAnalyser();
		this.analyser.fftSize = 1024;
		this.analyser.connect(audioContext.destination);

		const oscillator = new Osc3x(audioContext, this.analyser);
		oscillator.osc1 = {type: "sawtooth"};
		oscillator.osc2 = {type: "square"};
		oscillator.osc3 = {type: "sine"};

		this.state = {
			oscillator: oscillator,
		};
	}
	componentDidMount() {
		const canvasContext = this.canvas.getContext("2d");
		drawOscilloscope(this.canvas, canvasContext, this.analyser);
	}
	updateOsc3x(data) {
		if (data.gain != null) {
			this.state.oscillator.gain = data.gain;
		}
		if (data.osc1 != null) {
			this.state.oscillator.osc1 = data.osc1;
		}
		if (data.osc2 != null) {
			this.state.oscillator.osc2 = data.osc2;
		}
		if (data.osc3 != null) {
			this.state.oscillator.osc3 = data.osc3;
		}
		this.setState({});
	}
	render() {
		return j({div: {className: "content"}}, [
			j({div: {className: "top-content"}}, [
				j({canvas: {
					className: "oscilloscope",
					width: 800,
					height: 100,
					ref: (ref) => this.canvas = ref,
				}}),
				j([OscEditor, {
					oscillator: this.state.oscillator,
					updateOsc3x: this.updateOsc3x.bind(this),
				}]),
			]),
			j({div: {className: "bottom-content"}}, [
				j([Keyboard, {oscillator: this.state.oscillator}]),
			]),
		]);
	}
}

render(j(App), document.getElementById("react-root"));
