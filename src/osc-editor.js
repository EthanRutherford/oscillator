const {Component} = require("react");
const PropTypes = require("prop-types");
const j = require("react-jenny");
const Osc3x = require("./3xosc");
const {draw3xOsc} = require("./visualize");

const clamp = (val, min, max) => Math.min(Math.max(min, val), max);

class OscBar extends Component {
	setType(event) {
		this.props.update({type: event.target.value});
	}
	setMix(event) {
		const mixRatio = clamp(event.target.value, 0, 1);
		this.props.update({mixRatio});
	}
	setOctave(event) {
		const octave = Math.floor(clamp(event.target.value, -2, 2));
		this.props.update({octave});
	}
	render() {
		return j({div: {className: "osc"}}, [
			j({select: {
				value: this.props.settings.type,
				onChange: this.setType.bind(this),
			}}, [
				j({option: {value: "sine"}}, "sine"),
				j({option: {value: "square"}}, "square"),
				j({option: {value: "sawtooth"}}, "sawtooth"),
				j({option: {value: "triangle"}}, "triangle"),
			]),
			j({input: {
				type: "number",
				min: -2,
				max: 2,
				step: 1,
				value: this.props.settings.octave,
				onChange: this.setOctave.bind(this),
			}}),
			this.props.settings.mixRatio != null ?
			j({input: {
				type: "number",
				min: 0,
				max: 1,
				step: .01,
				value: this.props.settings.mixRatio,
				onChange: this.setMix.bind(this),
			}}) :
			j({input: {
				type: "number",
				min: 0,
				max: 1,
				step: .01,
				style: {visibility: "hidden"},
			}}),
		]);
	}
}

OscBar.propTypes = {
	settings: PropTypes.shape({
		type: PropTypes.string.isRequired,
		mixRatio: PropTypes.number,
		octave: PropTypes.number.isRequired,
	}).isRequired,
	update: PropTypes.func.isRequired,
};

class OscEditor extends Component {
	setGain(event) {
		const gain = clamp(event.target.value, 0, 1);
		this.props.updateOsc3x({gain});
	}
	updateOsc(which, data) {
		this.props.updateOsc3x({[which]: data});
	}
	render() {
		const wave = draw3xOsc(this.props.oscillator);
		return j({div: {className: "editor"}}, [
			j({div: {className: "top-bar"}}, [
				j({img: {className: "waveform", src: wave}}),
				j({input: {
					type: "number",
					min: 0,
					max: 1,
					step: .01,
					value: this.props.oscillator.gain,
					onChange: this.setGain.bind(this),
				}}),
			]),
			j({div: {className: "editor-content"}}, [
				j([OscBar, {
					settings: this.props.oscillator.osc1,
					update: (data) => this.updateOsc("osc1", data),
				}]),
				j([OscBar, {
					settings: this.props.oscillator.osc2,
					update: (data) => this.updateOsc("osc2", data),
				}]),
				j([OscBar, {
					settings: this.props.oscillator.osc3,
					update: (data) => this.updateOsc("osc3", data),
				}]),
			]),
		]);
	}
}

OscEditor.propTypes = {
	oscillator: PropTypes.instanceOf(Osc3x).isRequired,
	updateOsc3x: PropTypes.func.isRequired,
};

module.exports = OscEditor;
