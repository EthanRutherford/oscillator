const A0 = 27.5;
const pitchMap = Object.freeze({
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
});

function getPitch(note, octave) {
	let semitone = pitchMap[note] + 3;
	if (semitone > 12) {
		semitone -= 12;
	} else {
		octave -= 1;
	}
	return A0 * Math.pow(2, octave) * Math.pow(2, semitone / 12);
}

const audioContext = new AudioContext();

const analyser = audioContext.createAnalyser();
analyser.minDecibels = -100;
analyser.maxDecibels = 0;
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = .85;
analyser.connect(audioContext.destination);

const playingNotes = {};

function startNote(note, octave) {
	const name = `${note} - ${octave}`;
	if (playingNotes[name] != null) {
		return;
	}

	const osc1 = audioContext.createOscillator();
	osc1.type = "sawtooth";
	osc1.frequency.value = getPitch(note, octave);

	const osc2 = audioContext.createOscillator();
	osc2.type = "square";
	osc2.frequency.value = getPitch(note, octave - 1);

	const osc3 = audioContext.createOscillator();
	osc3.type = "sine";
	osc3.frequency.value = getPitch(note, octave - 2);
	const osc3Gain = audioContext.createGain();
	osc3Gain.gain.value = .8;
	osc3.connect(osc3Gain);

	const primaryGain = audioContext.createGain();
	primaryGain.gain.value = .2;
	osc1.connect(primaryGain);
	osc2.connect(primaryGain);
	osc3Gain.connect(primaryGain);
	primaryGain.connect(analyser);

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
	};

	merged.start();
	playingNotes[name] = merged;
}

function stopNote(note, octave) {
	const name = `${note} - ${octave}`;
	if (playingNotes[name] != null) {
		playingNotes[name].stop();
		playingNotes[name] = null;
	}
}

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

function toUnModified(char) {
	if (char.length === 1) {
		return keyModifierMap[char] || char.toLowerCase();
	}

	return char;
}

const keyMap = Object.freeze({
	//first row
	z: ["C", 4],
	s: ["Db", 4],
	x: ["D", 4],
	d: ["Eb", 4],
	c: ["E", 4],
	v: ["F", 4],
	g: ["Gb", 4],
	b: ["G", 4],
	h: ["Ab", 4],
	n: ["A", 4],
	j: ["Bb", 4],
	m: ["B", 4],
	",": ["C", 5],
	l: ["Db", 5],
	".": ["D", 5],
	";": ["Eb", 5],
	"/": ["E", 5],
	//second row
	q: ["C", 5],
	2: ["Db", 5],
	w: ["D", 5],
	3: ["Eb", 5],
	e: ["E", 5],
	r: ["F", 5],
	5: ["Gb", 5],
	t: ["G", 5],
	6: ["Ab", 5],
	y: ["A", 5],
	7: ["Bb", 5],
	u: ["B", 5],
	i: ["C", 6],
	9: ["Db", 6],
	o: ["D", 6],
	0: ["Eb", 6],
	p: ["E", 6],
});

window.addEventListener("keydown", (event) => {
	const key = toUnModified(event.key);
	if (key in keyMap) {
		event.preventDefault();
		const [note, octave] = keyMap[key];
		startNote(note, octave);
	}
});

window.addEventListener("keyup", (event) => {
	const key = toUnModified(event.key);
	if (key in keyMap) {
		event.preventDefault();
		const [note, octave] = keyMap[key];
		stopNote(note, octave);
	}
});

const canvas = document.querySelector("canvas");
const canvasContext = canvas.getContext("2d");

function visualize() {
	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;
	const dataArray = new Float32Array(analyser.fftSize);

	canvasContext.clearRect(0, 0, WIDTH, HEIGHT);

	const draw = function() {
		requestAnimationFrame(draw);

		analyser.getFloatTimeDomainData(dataArray);

		canvasContext.fillStyle = "rgb(200, 200, 200)";
		canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

		canvasContext.lineWidth = 2;
		canvasContext.strokeStyle = "rgb(0, 0, 0)";

		canvasContext.beginPath();

		const sliceWidth = WIDTH * 1.0 / analyser.fftSize;
		let x = 0;

		for (let i = 0; i < analyser.fftSize; i++) {
			const v = dataArray[i] * 50.0;
			const y = HEIGHT / 2 + v;

			if (i === 0) {
				canvasContext.moveTo(x, y);
			} else {
				canvasContext.lineTo(x, y);
			}

			x += sliceWidth;
		}

		canvasContext.lineTo(canvas.width, canvas.height / 2);
		canvasContext.stroke();
	};

	draw();
}

function drawWave() {
	function square(val) {
		return Math.floor(val / Math.PI) % 2 ? -1 : 1;
	}

	function sawtooth(val) {
		return ((val / Math.PI) % 2) - 1;
	}

	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;
	canvasContext.fillStyle = "rgb(200, 200, 200)";
	canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

	canvasContext.lineWidth = 2;
	canvasContext.strokeStyle = "rgb(0, 0, 0)";

	canvasContext.beginPath();

	const sliceWidth = WIDTH / 1000;
	let x = 0;

	for (let i = 0; i <= 1000; i++) {
		const amt = (i / 1000) * 2 * Math.PI;
		const sin = Math.sin(amt) * 8;
		const squ = square(amt * 2) * 10;
		const saw = sawtooth(amt * 4) * 10;
		const combine = sin + squ + saw;
		let y = -combine + HEIGHT / 2;

		if (i === 0) {
			canvasContext.moveTo(x, y);
		} else {
			canvasContext.lineTo(x, y);
		}

		x += sliceWidth;
	}

	canvasContext.stroke();
}

visualize();
// drawWave();
