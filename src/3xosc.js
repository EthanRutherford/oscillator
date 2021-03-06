const {getPitch} = require("./sound-util");

const removeUndef = (obj) => Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]) || obj;
const immuteClone = (a, b) => Object.freeze(Object.assign({}, a, removeUndef(b)));

module.exports = class Osc3x {
	constructor(audioContext, destination = audioContext.destination) {
		this._context = audioContext;
		this._destination = destination;
		this._playingNotes = {};
		this._osc1 = Object.freeze({
			type: "sine",
			octave: 0,
		});
		this._osc2 = Object.freeze({
			type: "sine",
			mixRatio: .5,
			octave: -1,
		});
		this._osc3 = Object.freeze({
			type: "sine",
			mixRatio: .4,
			octave: -2,
		});
		this._gainValue = .6;
		this._gain = audioContext.createGain();
		this._gain.gain.value = this._gainValue;
		this._gain.connect(destination);
	}
	get osc1() {
		return this._osc1;
	}
	set osc1({type, octave}) {
		this._osc1 = immuteClone(this._osc1, {type, octave});

		for (const note of Object.values(this._playingNotes)) {
			note.update();
		}
	}
	get osc2() {
		return this._osc2;
	}
	set osc2({type, mixRatio, octave}) {
		this._osc2 = immuteClone(this._osc2, {type, mixRatio, octave});

		for (const note of Object.values(this._playingNotes)) {
			note.update();
		}
	}
	get osc3() {
		return this._osc3;
	}
	set osc3({type, mixRatio, octave}) {
		this._osc3 = immuteClone(this._osc3, {type, mixRatio, octave});

		for (const note of Object.values(this._playingNotes)) {
			note.update();
		}
	}
	get gain() {
		return this._gainValue;
	}
	set gain(val) {
		this._gainValue = val;
		this._gain.gain.value = val;

		for (const note of Object.values(this._playingNotes)) {
			note.update();
		}
	}
	getGains() {
		const gain3 = this._osc3.mixRatio;
		const gain2 = (1 - gain3) * this._osc2.mixRatio;
		const gain1 = 1 - gain3 - gain2;

		return {gain1, gain2, gain3};
	}
	startNote(note, octave) {
		const name = `${note} - ${octave}`;
		if (this._playingNotes[name] != null) {
			return;
		}

		//calculate gain levels from mix levels
		const {gain1, gain2, gain3} = this.getGains();

		//create oscillators
		const osc1 = this._context.createOscillator();
		osc1.type = this._osc1.type;
		osc1.frequency.value = getPitch(note, octave + this._osc1.octave);
		const osc1Gain = this._context.createGain();
		osc1Gain.gain.value = gain1;
		osc1.connect(osc1Gain);

		const osc2 = this._context.createOscillator();
		osc2.type = this._osc2.type;
		osc2.frequency.value = getPitch(note, octave + this._osc2.octave);
		const osc2Gain = this._context.createGain();
		osc2Gain.gain.value = gain2;
		osc2.connect(osc2Gain);

		const osc3 = this._context.createOscillator();
		osc3.type = this._osc3.type;
		osc3.frequency.value = getPitch(note, octave + this._osc3.octave);
		const osc3Gain = this._context.createGain();
		osc3Gain.gain.value = gain3;
		osc3.connect(osc3Gain);

		//attatch to gain
		osc1Gain.connect(this._gain);
		osc2Gain.connect(this._gain);
		osc3Gain.connect(this._gain);

		const merged = {
			start() {
				osc1.start();
				osc2.start();
				osc3.start();
			},
			stop() {
				osc1.stop();
				osc2.stop();
				osc3.stop();
			},
			update: () => {
				const {gain1, gain2, gain3} = this.getGains();
				osc1Gain.gain.value = gain1;
				osc2Gain.gain.value = gain2;
				osc3Gain.gain.value = gain3;

				osc1.type = this._osc1.type;
				osc2.type = this._osc2.type;
				osc3.type = this._osc3.type;

				osc1.frequency.value = getPitch(note, octave + this._osc1.octave);
				osc2.frequency.value = getPitch(note, octave + this._osc2.octave);
				osc3.frequency.value = getPitch(note, octave + this._osc3.octave);
			},
		};

		//start and track note
		merged.start();
		this._playingNotes[name] = merged;
	}
	stopNote(note, octave) {
		const name = `${note} - ${octave}`;
		if (this._playingNotes[name] != null) {
			this._playingNotes[name].stop();
			delete this._playingNotes[name];
		}
	}
};
