const {toUnModified, toneFromKey} = require("./keyboard");

const topRow = "q2w3er5t6y7ui9o0p";
const bottomRow = "zsxdcvgbhnjm,l.;/";

const keyElements = {};

function createKey(className, key, oscillator) {
	const element = document.createElement("div");
	element.className = className + " key";
	element.dataset.key = key;
	const innerElement = document.createElement("div");
	innerElement.innerText = key;
	element.append(innerElement);

	element.addEventListener("mousedown", () => {
		const tone = toneFromKey(key);
		tone.key = key;
		oscillator.startNote(tone.note, tone.octave);
		startKey(key);
		currentKeys.mouse = tone;
	});

	element.addEventListener("mouseenter", () => {
		const oldTone = currentKeys.mouse;
		if (oldTone) {
			oscillator.stopNote(oldTone.note, oldTone.octave);
			stopKey(oldTone.key);
			delete currentKeys.mouse;

			const tone = toneFromKey(key);
			tone.key = key;
			oscillator.startNote(tone.note, tone.octave);
			startKey(key);
			currentKeys.mouse = tone;
		}
	});

	element.addEventListener("touchstart", (event) => {
		event.preventDefault();

		for (const touch of event.changedTouches) {
			const tone = toneFromKey(key);
			tone.key = key;
			tone.target = touch.target;
			oscillator.startNote(tone.note, tone.octave);
			startKey(key);
			currentKeys[touch.identifier] = tone;
		}
	});

	element.addEventListener("touchmove", (event) => {
		event.preventDefault();

		for (const touch of event.changedTouches) {
			const oldTone = currentKeys[touch.identifier];
			if (oldTone) {
				let elem = document.elementFromPoint(touch.clientX, touch.clientY);
				if (elem && !elem.classList.contains("key")) {
					elem = elem.parentElement;
				}

				if (elem == null) {
					continue;
				}

				if (elem.classList.contains("key") && elem !== oldTone.target) {
					oscillator.stopNote(oldTone.note, oldTone.octave);
					stopKey(oldTone.key);
					delete currentKeys[touch.identifier];

					const tone = toneFromKey(elem.dataset.key);
					tone.key = elem.dataset.key;
					tone.target = elem;
					oscillator.startNote(tone.note, tone.octave);
					startKey(elem.dataset.key);
					currentKeys[touch.identifier] = tone;
				}
			}
		}
	});

	keyElements[key] = element;

	return element;
}

function createKeys(element, row, oscillator) {
	element.append(createKey("white-key", row[0], oscillator));
	element.append(createKey("black-key", row[1], oscillator));
	element.append(createKey("white-key", row[2], oscillator));
	element.append(createKey("black-key", row[3], oscillator));
	element.append(createKey("white-key", row[4], oscillator));
	element.append(createKey("white-key", row[5], oscillator));
	element.append(createKey("black-key", row[6], oscillator));
	element.append(createKey("white-key", row[7], oscillator));
	element.append(createKey("black-key", row[8], oscillator));
	element.append(createKey("white-key", row[9], oscillator));
	element.append(createKey("black-key", row[10], oscillator));
	element.append(createKey("white-key", row[11], oscillator));
	element.append(createKey("white-key", row[12], oscillator));
	element.append(createKey("black-key", row[13], oscillator));
	element.append(createKey("white-key", row[14], oscillator));
	element.append(createKey("black-key", row[15], oscillator));
	element.append(createKey("white-key", row[16], oscillator));
}

const currentKeys = {};

function startKey(key) {
	keyElements[key].classList.add("pressed");
}

function stopKey(key) {
	keyElements[key].classList.remove("pressed");
}

module.exports = {
	setupController(oscillator) {
		createKeys(document.getElementById("top-row"), topRow, oscillator);
		createKeys(document.getElementById("bottom-row"), bottomRow, oscillator);

		window.addEventListener("mouseup", () => {
			const tone = currentKeys.mouse;
			if (tone) {
				oscillator.stopNote(tone.note, tone.octave);
				stopKey(tone.key);
				delete currentKeys.mouse;
			}
		});

		window.addEventListener("touchend", (event) => {
			event.preventDefault();

			for (const touch of event.changedTouches) {
				const tone = currentKeys[touch.identifier];
				if (tone) {
					oscillator.stopNote(tone.note, tone.octave);
					stopKey(tone.key);
					delete currentKeys[touch.identifier];
				}
			}
		});

		window.addEventListener("keydown", (event) => {
			if (event.ctrlKey) return;

			const key = toUnModified(event.key);
			const tone = toneFromKey(key);
			if (tone) {
				event.preventDefault();
				oscillator.startNote(tone.note, tone.octave);
				startKey(key);
				currentKeys[key] = tone;
			}
		});

		window.addEventListener("keyup", (event) => {
			const key = toUnModified(event.key);
			const tone = currentKeys[key];
			if (tone) {
				event.preventDefault();
				oscillator.stopNote(tone.note, tone.octave);
				stopKey(key);
				delete currentKeys[key];
			}
		});
	},
};
