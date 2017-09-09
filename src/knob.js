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
		this.mouseDown = this.mouseDown.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.touchStart = this.touchStart.bind(this);
		this.touchMove = this.touchMove.bind(this);
		this.touchEnd = this.touchEnd.bind(this);
		this.knobRef = (ref) => this.knob = ref;

		this._currentTouch = null;
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
		window.removeEventListener("mousemove", this.mouseMove);
		window.removeEventListener("mouseup", this.mouseUp);
	}
	handleMove(amt) {
		const pct = amt / this.knob.offsetHeight;
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
	mouseDown(event) {
		if (event.button === 0) {
			event.preventDefault();
			window.addEventListener("mousemove", this.mouseMove);
			window.addEventListener("mouseup", this.mouseUp);
		}
	}
	mouseMove(event) {
		this.handleMove(-event.movementY);
	}
	mouseUp(event) {
		if (event.button === 0) {
			window.removeEventListener("mousemove", this.mouseMove);
			window.removeEventListener("mouseup", this.mouseUp);

			this._internalValue = normalizeValue(
				this.props.value,
				this.props.min,
				this.props.max,
			);
		}
	}
	touchStart(event) {
		if (this._currentTouch == null) {
			const touch = event.changedTouches[0];
			this._currentTouch = touch;

			window.addEventListener("touchmove", this.touchMove);
			window.addEventListener("touchend", this.touchEnd);
		}
	}
	touchMove(event) {
		let curTouch;
		for (const touch of event.changedTouches) {
			if (touch.identifier === this._currentTouch.identifier) {
				curTouch = touch;
			}
		}

		if (!curTouch) {
			return;
		}

		this.handleMove(this._currentTouch.pageY - curTouch.pageY);
		this._currentTouch = curTouch;
	}
	touchEnd(event) {
		let curTouch;
		for (const touch of event.changedTouches) {
			if (touch.identifier === this._currentTouch.identifier) {
				curTouch = touch;
			}
		}

		if (!curTouch) {
			return;
		}

		this._currentTouch = null;

		window.removeEventListener("touchmove", this.touchMove);
		window.removeEventListener("touchend", this.touchEnd);
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
				onMouseDown: this.mouseDown,
				onTouchStart: this.touchStart,
				ref: this.knobRef,
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
