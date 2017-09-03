const A0 = 27.5;
const pitchMap = {
	C: 0,
	"C#": 1, Db: 1,
	D: 2,
	"D#": 3, Eb: 3,
	E: 4,
	F: 5,
	"F#": 6, Gb: 6,
	G: 7,
	"G#": 8, Ab: 8,
	A: 9,
	"A#": 10, Bb: 10,
	B: 11,
};

function getPitch(note, octave) {
	let semitone = pitchMap[note] + 3;
	if (semitone > 12) {
		semitone -= 12;
	} else {
		octave -= 1;
	}
	return A0 * Math.pow(2, octave) * Math.pow(2, semitone / 12);
}

module.exports = {
	getPitch,
};
