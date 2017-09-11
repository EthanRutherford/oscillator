const {PureComponent} = require("react");
const PropTypes = require("prop-types");
const j = require("react-jenny");
const {merge} = require("./util");
const {toUnModified, toneFromKey} = require("./key-util");
const Osc3x = require("./3xosc");

const keyColors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0];
const topRow = "q2w3er5t6y7ui9o0p";
const bottomRow = "zsxdcvgbhnjm,l.;/";
const bothRows = topRow + bottomRow;

class Key extends PureComponent {
	componentWillMount() {
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseEnter = this.onMouseEnter.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
	}
	onMouseDown(event) {
		if (event.button === 0) {
			this.props.start(this.props.keyName, "mouse");
		}
	}
	onMouseEnter(event) {
		if (event.buttons > 0 && event.button === 0) {
			this.props.stop("mouse");
			this.props.start(this.props.keyName, "mouse");
		}
	}
	onTouchStart(event) {
		for (const touch of event.changedTouches) {
			this.props.start(this.props.keyName, touch.identifier);
		}
	}
	render() {
		const pressed = this.props.keyState ? " pressed" : "";
		return j({div: {
			className: this.props.className + pressed,
			onMouseDown: this.onMouseDown,
			onMouseEnter: this.onMouseEnter,
			onTouchStart: this.onTouchStart,
			"data-key": this.props.keyName,
		}}, [
			j("div", this.props.keyName),
		]);
	}
}

Key.propTypes = {
	className: PropTypes.string.isRequired,
	keyName: PropTypes.string.isRequired,
	keyState: PropTypes.bool.isRequired,
	start: PropTypes.func.isRequired,
	stop: PropTypes.func.isRequired,
};

class KeyRow extends PureComponent {
	shouldComponentUpdate(nextProps) {
		for (const char of nextProps.row) {
			if (nextProps.keyState[char] !== this.props.keyState[char]) {
				return true;
			}
		}

		return false;
	}
	render() {
		const row = [...this.props.row];
		return j({div: "key-row"}, row.map((key, i) =>
			j([Key, {
				className: keyColors[i] === 0 ? "white-key" : "black-key",
				keyName: key,
				keyState: this.props.keyState[key],
				start: this.props.start,
				stop: this.props.stop,
				key,
			}]),
		));
	}
}

KeyRow.propTypes = {
	row: PropTypes.string.isRequired,
	keyState: PropTypes.objectOf(PropTypes.bool).isRequired,
	start: PropTypes.func.isRequired,
	stop: PropTypes.func.isRequired,
};

class Keyboard extends PureComponent {
	componentWillMount() {
		this.start = this.start.bind(this);
		this.stop = this.stop.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.touchMove = this.touchMove.bind(this);
		this.touchEnd = this.touchEnd.bind(this);
		this.keyDown = this.keyDown.bind(this);
		this.keyUp = this.keyUp.bind(this);
		this.sources = {};

		this.state = {
			keyState: [...bothRows].reduce((obj, x) => {
				obj[x] = false;
				return obj;
			}, {}),
		};
	}
	componentDidMount() {
		window.addEventListener("mouseup", this.mouseUp);
		window.addEventListener("touchmove", this.touchMove);
		window.addEventListener("touchend", this.touchEnd);
		window.addEventListener("keydown", this.keyDown);
		window.addEventListener("keyup", this.keyUp);
	}
	componentWillUnmount() {
		window.removeEventListener("mouseup", this.mouseUp);
		window.removeEventListener("touchend", this.touchEnd);
		window.removeEventListener("keydown", this.keyDown);
		window.removeEventListener("keyup", this.keyUp);
	}
	mouseUp() {
		this.stop("mouse");
	}
	touchMove(event) {
		for (const touch of event.changedTouches) {
			const oldKey = this.sources[touch.identifier];
			if (oldKey) {
				let elem = document.elementFromPoint(touch.clientX, touch.clientY);
				if (elem && !elem.dataset.key) {
					elem = elem.parentElement;
				}

				if (elem && elem.dataset.key && elem.dataset.key !== oldKey) {
					this.stop(touch.identifier);

					this.start(elem.dataset.key, touch.identifier);
				}
			}
		}
	}
	touchEnd(event) {
		for (const touch of event.changedTouches) {
			this.stop(touch.identifier);
		}
	}
	keyDown(event) {
		if (event.ctrlKey) return;

		const key = toUnModified(event.key);
		if (bothRows.includes(key)) {
			event.preventDefault();
			this.start(key, key);
		}
	}
	keyUp(event) {
		const key = toUnModified(event.key);
		this.stop(key);
	}
	start(key, id) {
		const tone = toneFromKey(key);
		this.props.oscillator.startNote(tone.note, tone.octave);
		this.sources[id] = key;

		this.setState((state) => ({
			keyState: merge(state.keyState, {
				[key]: true,
			}),
		}));
	}
	stop(id) {
		const key = this.sources[id];
		if (key == null) {
			return;
		}

		const tone = toneFromKey(key);
		this.props.oscillator.stopNote(tone.note, tone.octave);
		delete this.sources[id];

		this.setState((state) => ({
			keyState: merge(state.keyState, {
				[key]: false,
			}),
		}));
	}
	render() {
		return j({div: "keyboard"}, [
			j([KeyRow, {
				row: topRow,
				keyState: this.state.keyState,
				start: this.start,
				stop: this.stop,
			}]),
			j([KeyRow, {
				row: bottomRow,
				keyState: this.state.keyState,
				start: this.start,
				stop: this.stop,
			}]),
		]);
	}
}

Keyboard.propTypes = {
	oscillator: PropTypes.instanceOf(Osc3x).isRequired,
};

module.exports = Keyboard;
