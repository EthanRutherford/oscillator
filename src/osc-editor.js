const {Component, PureComponent} = require("react");
const PropTypes = require("prop-types");
const j = require("react-jenny");
const Knob = require("./knob");
const Roller = require("./roller");
const Osc3x = require("./3xosc");
const {draw3xOsc} = require("./visualize");

class OscBar extends PureComponent {
	componentWillMount() {
		this.setType = this.setType.bind(this);
		this.setMix = this.setMix.bind(this);
		this.setOctave = this.setOctave.bind(this);
	}
	setType(value) {
		this.props.update({type: value});
	}
	setMix(value) {
		this.props.update({mixRatio: value});
	}
	setOctave(value) {
		this.props.update({octave: value});
	}
	renderMix() {
		if (this.props.settings.mixRatio == null) {
			return j({div: "osc-knob-placeholder"});
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
		return j({div: "osc-row"}, [
			j([Roller, {
				className: "osc-roller",
				items: ["sine", "square", "sawtooth", "triangle"],
				value: this.props.settings.type,
				onChange: this.setType,
			}]),
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

		return j({div: "editor"}, [
			j({div: "top-bar"}, [
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
			j({div: "editor-content"}, [
				j({div: "osc-row"}, [
					j({span: "column-title"}, "waveform"),
					j({span: "column-title"}, "octave"),
					j({span: "column-title"}, "mix ratio"),
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
