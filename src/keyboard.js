const {Component} = require("react");
const PropTypes = require("prop-types");
const j = require("react-jenny");
const {merge} = require("./util");
const {toUnModified, toneFromKey} = require("./key-util");
const Osc3x = require("./3xosc");

const keyColors = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0];
const topRow = "q2w3er5t6y7ui9o0p";
const bottomRow = "zsxdcvgbhnjm,l.;/";
const bothRows = topRow + bottomRow;

class Key extends Component {
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
			onMouseDown: this.onMouseDown.bind(this),
			onMouseEnter: this.onMouseEnter.bind(this),
			onTouchStart: this.onTouchStart.bind(this),
			"data-key": this.props.keyName,
		}}, [
			j("div", this.props.keyName),
		]);
	}
}

Key.propTypes = {
	className: PropTypes.string,
	keyName: PropTypes.string,
	keyState: PropTypes.bool,
	start: PropTypes.func,
	stop: PropTypes.func,
};

class KeyRow extends Component {
	render() {
		const row = [...this.props.row];
		return j({div: {className: "key-row"}}, row.map((key, i) =>
			j([Key, {
				className: keyColors[i] === 0 ? "white-key" : "black-key",
				keyName: key,
				keyState: this.props.keyState[key],
				start: this.props.start,
				stop: this.props.stop,
				key,
			}])
		));
	}
}

KeyRow.propTypes = {
	row: PropTypes.string,
	keyState: PropTypes.objectOf(PropTypes.bool),
	start: PropTypes.func,
	stop: PropTypes.func,
};

class Keyboard extends Component {
	constructor(...args) {
		super(...args);
		this.state = {
			keyState: {
			},
			sources: {},
		};
		this._mouseUp = this.mouseUp.bind(this);
		this._touchMove = this.touchMove.bind(this);
		this._touchEnd = this.touchEnd.bind(this);
		this._keyDown = this.keyDown.bind(this);
		this._keyUp = this.keyUp.bind(this);
	}
	componentDidMount() {
		window.addEventListener("mouseup", this._mouseUp);
		window.addEventListener("touchmove", this._touchMove);
		window.addEventListener("touchend", this._touchEnd);
		window.addEventListener("keydown", this._keyDown);
		window.addEventListener("keyup", this._keyUp);
	}
	componentWillUnmount() {
		window.removeEventListener("mouseup", this._mouseUp);
		window.removeEventListener("touchend", this._touchEnd);
		window.removeEventListener("keydown", this._keyDown);
		window.removeEventListener("keyup", this._keyUp);
	}
	mouseUp() {
		this.stop("mouse");
	}
	touchMove(event) {
		for (const touch of event.changedTouches) {
			const oldKey = this.state.sources[touch.identifier];
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

		this.setState((state) => ({
			keyState: merge(state.keyState, {
				[key]: true,
			}),
			sources: merge(state.sources, {
				[id]: key,
			}),
		}));
	}
	stop(id) {
		const key = this.state.sources[id];
		if (key == null) {
			return;
		}

		const tone = toneFromKey(key);
		this.props.oscillator.stopNote(tone.note, tone.octave);

		this.setState((state) => {
			const newSources = merge(state.sources);
			delete newSources[id];
			return {
				keyState: merge(state.keyState, {
					[key]: false,
				}),
				sources: newSources,
			};
		});
	}
	render() {
		return j("div", [
			j([KeyRow, {
				row: topRow,
				keyState: this.state.keyState,
				start: this.start.bind(this),
				stop: this.stop.bind(this),
			}]),
			j([KeyRow, {
				row: bottomRow,
				keyState: this.state.keyState,
				start: this.start.bind(this),
				stop: this.stop.bind(this),
			}]),
		]);
	}
}

Keyboard.propTypes = {
	oscillator: PropTypes.instanceOf(Osc3x),
};

module.exports = Keyboard;
