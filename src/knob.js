const {PureComponent} = require("react");
const PropTypes = require("prop-types");
const j = require("react-jenny");
require("../styles/knob.css");
const {clamp} = require("./util");

function normalizeValue(value, min, max) {
	const diff = max - min;
	return (value - min) / diff;
}

function unNormalizeValue(value, min, max) {
	const diff = max - min;
	return (value * diff) + min;
}

class Knob extends PureComponent {
	componentWillMount() {
		this._mouseMove = this.mouseMove.bind(this);
		this._mouseUp = this.mouseUp.bind(this);

		this._internalValue = normalizeValue(
			this.props.value,
			this.props.min,
			this.props.max,
		);
	}
	componentWillReceiveProps(nextProps) {
		this._internalValue = normalizeValue(
			nextProps.value,
			nextProps.min,
			nextProps.max,
		);
	}
	componentWillUnmount() {
		window.removeEventListener("mousemove", this._mouseMove);
		window.removeEventListener("mouseup", this._mouseUp);
	}
	mouseDown(event) {
		if (event.button === 0) {
			event.preventDefault();
			window.addEventListener("mousemove", this._mouseMove);
			window.addEventListener("mouseup", this._mouseUp);
		}
	}
	mouseMove(event) {
		const pct = -event.movementY / this.knob.offsetHeight;
		this._internalValue = clamp(this._internalValue + pct, 0, 1);

		let newValue = unNormalizeValue(
			this._internalValue,
			this.props.min,
			this.props.max,
		);

		if (this.props.step != null) {
			const step = this.props.step;
			newValue = Math.round(newValue / step) * step;
		}

		if (newValue !== this.props.value) {
			this.props.onChange(newValue);
		}
	}
	mouseUp(event) {
		if (event.button === 0) {
			window.removeEventListener("mousemove", this._mouseMove);
			window.removeEventListener("mouseup", this._mouseUp);

			this._internalValue = normalizeValue(
				this.props.value,
				this.props.min,
				this.props.max,
			);
		}
	}
	render() {
		const angle = this._internalValue * 270;

		return j({div: {
			className: `knob-background ${this.props.className}`,
		}}, [
			j({div: {
				className: "knob-input",
				style: {transform: `rotate(${angle}deg)`},
				title: this.props.value,
				onMouseDown: this.mouseDown.bind(this),
				ref: (ref) => this.knob = ref,
			}}, [
				j({div: {
					className: "knob-dot",
					style: {transform: `rotate(${-angle}deg)`},
				}}),
			]),
		]);
	}
}

Knob.propTypes = {
	className: PropTypes.string,
	min: PropTypes.number.isRequired,
	max: PropTypes.number.isRequired,
	step: PropTypes.number,
	value: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
};

module.exports = Knob;
