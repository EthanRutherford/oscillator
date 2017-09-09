const {Component, PureComponent} = require("react");
const PropTypes = require("prop-types");
const j = require("react-jenny");
const Knob = require("./knob");
const Osc3x = require("./3xosc");
const {draw3xOsc} = require("./visualize");

class OscBar extends PureComponent {
	componentWillMount() {
		this.setType = this.setType.bind(this);
		this.setMix = this.setMix.bind(this);
		this.setOctave = this.setOctave.bind(this);
	}
	setType(event) {
		this.props.update({type: event.target.value});
	}
	setMix(value) {
		this.props.update({mixRatio: value});
	}
	setOctave(value) {
		this.props.update({octave: value});
	}
	renderMix() {
		if (this.props.settings.mixRatio == null) {
			return j({div: {className: "osc-knob-placeholder"}});
		}

		return j([Knob, {
			className: "osc-knob",
			min: 0,
			max: 1,
			step: .01,
			value: this.props.settings.mixRatio,
			onChange: this.setMix,
		}]);
	}
	render() {
		return j({div: {className: "osc-row"}}, [
			j({select: {
				value: this.props.settings.type,
				onChange: this.setType,
			}}, [
				j({option: {value: "sine"}}, "sine"),
				j({option: {value: "square"}}, "square"),
				j({option: {value: "sawtooth"}}, "sawtooth"),
				j({option: {value: "triangle"}}, "triangle"),
			]),
			j([Knob, {
				className: "osc-knob",
				min: -2,
				max: 2,
				step: 1,
				value: this.props.settings.octave,
				onChange: this.setOctave,
			}]),
			this.renderMix(),
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
	componentWillMount() {
		this.setGain = this.setGain.bind(this);
		this.updateOsc1 = this.updateOsc.bind(this, "osc1");
		this.updateOsc2 = this.updateOsc.bind(this, "osc2");
		this.updateOsc3 = this.updateOsc.bind(this, "osc3");
	}
	setGain(value) {
		this.props.updateOsc3x({gain: value});
	}
	updateOsc(which, data) {
		this.props.updateOsc3x({[which]: data});
	}
	render() {
		const wave = draw3xOsc(this.props.oscillator);

		return j({div: {className: "editor"}}, [
			j({div: {className: "top-bar"}}, [
				j({img: {className: "waveform", src: wave}}),
				j([Knob, {
					className: "gain-knob",
					min: 0,
					max: 1,
					step: .01,
					value: this.props.oscillator.gain,
					onChange: this.setGain,
				}]),
			]),
			j({div: {className: "editor-content"}}, [
				j({div: {className: "osc-row"}}, [
					j({span: {className: "column-title"}}, "waveform"),
					j({span: {className: "column-title"}}, "octave"),
					j({span: {className: "column-title"}}, "mix ratio"),
				]),
				j([OscBar, {
					settings: this.props.oscillator.osc1,
					update: this.updateOsc1,
				}]),
				j([OscBar, {
					settings: this.props.oscillator.osc2,
					update: this.updateOsc2,
				}]),
				j([OscBar, {
					settings: this.props.oscillator.osc3,
					update: this.updateOsc3,
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
