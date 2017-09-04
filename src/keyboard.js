const {j, Controller} = require("jenny-js");
const {toUnModified, toneFromKey} = require("./key-util");

const topRow = "q2w3er5t6y7ui9o0p";
const bottomRow = "zsxdcvgbhnjm,l.;/";

const currentKeys = {};

function findController(element) {
	do {
		if (element.controller) return element.controller;
	} while ((element = element.parentElement));
	return null;
}

class Key extends Controller {
	init() {
		const ref = (ref) => {
			this._keyDiv = ref;
			this.props.setRef(ref.controller, this.key);
		};

		return j({div: {
			class: this.props.class,
			onmousedown: () => this.onMouseDown(),
			onmouseenter: () => this.onMouseEnter(),
			ref,
		}}, [
			j({div: 0}, [this.key]),
		]);
	}
	didMount() {
		this._keyDiv.addEventListener("touchstart",
			(event) => this.onTouchStart(event)
		);
		this._keyDiv.addEventListener("touchmove",
			(event) => this.onTouchMove(event)
		);
	}
	press() {
		this.model.classList.add("pressed");
	}
	release() {
		this.model.classList.remove("pressed");
	}
	get key() {
		return this.props.key;
	}
	start(id) {
		const tone = toneFromKey(this.key);
		tone.key = this;
		this.props.oscillator.startNote(tone.note, tone.octave);
		this.press();
		currentKeys[id] = tone;
	}
	stop(id) {
		const tone = toneFromKey(this.key);
		this.props.oscillator.stopNote(tone.note, tone.octave);
		this.release();
		delete currentKeys[id];
	}
	onMouseDown() {
		this.start("mouse");
	}
	onMouseEnter() {
		const oldTone = currentKeys.mouse;
		if (oldTone) {
			oldTone.key.stop("mouse");

			this.start("mouse");
		}
	}
	onTouchStart(event) {
		event.preventDefault();

		for (const touch of event.changedTouches) {
			this.start(touch.identifier);
		}
	}
	onTouchMove(event) {
		event.preventDefault();

		for (const touch of event.changedTouches) {
			const oldTone = currentKeys[touch.identifier];
			if (oldTone) {
				const elem = document.elementFromPoint(touch.clientX, touch.clientY);
				const controller = findController(elem);

				if (controller instanceof Key && controller !== oldTone.key) {
					oldTone.key.stop(touch.identifier);

					controller.start(touch.identifier);
				}
			}
		}
	}
}

Key.propTypes = {
	class: String,
	key: String,
	oscillator: Object,
	setRef: Function,
};

class KeyRow extends Controller {
	init() {
		const row = this.props.row;
		const oscillator = this.props.oscillator;
		const setRef = this.props.setRef;

		return j({div: {class: "key-row"}}, [
			j([Key, {class: "white-key", key: row[0], oscillator, setRef}]),
			j([Key, {class: "black-key", key: row[1], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[2], oscillator, setRef}]),
			j([Key, {class: "black-key", key: row[3], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[4], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[5], oscillator, setRef}]),
			j([Key, {class: "black-key", key: row[6], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[7], oscillator, setRef}]),
			j([Key, {class: "black-key", key: row[8], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[9], oscillator, setRef}]),
			j([Key, {class: "black-key", key: row[10], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[11], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[12], oscillator, setRef}]),
			j([Key, {class: "black-key", key: row[13], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[14], oscillator, setRef}]),
			j([Key, {class: "black-key", key: row[15], oscillator, setRef}]),
			j([Key, {class: "white-key", key: row[16], oscillator, setRef}]),
		]);
	}
}

KeyRow.propTypes = {
	row: String,
	oscillator: Object,
	setRef: Function,
};

class Keyboard extends Controller {
	init() {
		this._keyDown = (event) => this.keyDown(event);
		this._keyUp = (event) => this.keyUp(event);

		const oscillator = this.props.oscillator;
		this.keys = {};
		const setRef = (ref, key) => this.keys[key] = ref;

		return j({div: 0}, [
			j([KeyRow, {row: topRow, oscillator, setRef}]),
			j([KeyRow, {row: bottomRow, oscillator, setRef}]),
		]);
	}
	didMount() {
		window.addEventListener("mouseup", Keyboard.mouseUp);
		window.addEventListener("touchend", Keyboard.touchEnd);
		window.addEventListener("keydown", this._keyDown);
		window.addEventListener("keyup", this._keyUp);
	}
	didUnMount() {
		window.removeEventListener("mouseup", Keyboard.mouseUp);
		window.removeEventListener("touchend", Keyboard.touchEnd);
		window.removeEventListener("keydown", this._keyDown);
		window.removeEventListener("keyup", this._keyUp);
	}
	static mouseUp() {
		const tone = currentKeys.mouse;
		if (tone) {
			tone.key.stop("mouse");
		}
	}
	static touchEnd(event) {
		event.preventDefault();

		for (const touch of event.changedTouches) {
			const tone = currentKeys[touch.identifier];
			if (tone) {
				tone.key.stop(touch.identifier);
			}
		}
	}
	keyDown(event) {
		if (event.ctrlKey) return;

		const key = toUnModified(event.key);
		const keyController = this.keys[key];
		if (keyController) {
			event.preventDefault();
			keyController.start(key);
		}
	}
	keyUp(event) {
		const key = toUnModified(event.key);
		const tone = currentKeys[key];
		if (tone) {
			tone.key.stop(key);
		}
	}
}

Keyboard.propTypes = {
	oscillator: Object,
};

module.exports = Keyboard;
