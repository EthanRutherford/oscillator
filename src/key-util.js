const keyModifierMap = {
	"<": ",",
	">": ".",
	"?": "/",
	":": ";",
	"@": 2,
	"#": 3,
	"%": 5,
	"^": 6,
	"&": 7,
	"(": 9,
	")": 0,
};

const keyMap = {
	//first row
	z: {note: "C", octave: 4},
	s: {note: "Db", octave: 4},
	x: {note: "D", octave: 4},
	d: {note: "Eb", octave: 4},
	c: {note: "E", octave: 4},
	v: {note: "F", octave: 4},
	g: {note: "Gb", octave: 4},
	b: {note: "G", octave: 4},
	h: {note: "Ab", octave: 4},
	n: {note: "A", octave: 4},
	j: {note: "Bb", octave: 4},
	m: {note: "B", octave: 4},
	",": {note: "C", octave: 5},
	l: {note: "Db", octave: 5},
	".": {note: "D", octave: 5},
	";": {note: "Eb", octave: 5},
	"/": {note: "E", octave: 5},
	//second row
	q: {note: "C", octave: 5},
	2: {note: "Db", octave: 5},
	w: {note: "D", octave: 5},
	3: {note: "Eb", octave: 5},
	e: {note: "E", octave: 5},
	r: {note: "F", octave: 5},
	5: {note: "Gb", octave: 5},
	t: {note: "G", octave: 5},
	6: {note: "Ab", octave: 5},
	y: {note: "A", octave: 5},
	7: {note: "Bb", octave: 5},
	u: {note: "B", octave: 5},
	i: {note: "C", octave: 6},
	9: {note: "Db", octave: 6},
	o: {note: "D", octave: 6},
	0: {note: "Eb", octave: 6},
	p: {note: "E", octave: 6},
};

module.exports = {
	toUnModified(key) {
		if (key.length === 1) {
			return keyModifierMap[key] || key.toLowerCase();
		}

		return key;
	},
	toneFromKey(unmodifiedKey) {
		const tone = keyMap[unmodifiedKey];
		return tone ? Object.assign({}, tone) : undefined;
	},
};
