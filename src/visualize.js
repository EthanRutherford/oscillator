const imageCanvas = document.createElement("canvas");
imageCanvas.width = 200;
imageCanvas.height = 100;
const imageContext = imageCanvas.getContext("2d");

const funcs = {
	sine: Math.sin,
	square(val) {
		return Math.floor(val / Math.PI) % 2 ? -1 : 1;
	},
	sawtooth(val) {
		return ((val / Math.PI) % 2) - 1;
	},
	triangle(val) {
		return 0; //TODO
	},
};

module.exports = {
	drawOscilloscope(canvas, context, analyser) {
		const dataArray = new Float32Array(analyser.fftSize);
		context.clearRect(0, 0, canvas.width, canvas.height);

		const draw = function() {
			requestAnimationFrame(draw);

			analyser.getFloatTimeDomainData(dataArray);

			context.fillStyle = "rgb(200, 200, 200)";
			context.fillRect(0, 0, canvas.width, canvas.height);

			context.lineWidth = 2;
			context.strokeStyle = "rgb(0, 0, 0)";
			context.beginPath();

			const sliceWidth = canvas.width * 1.0 / analyser.fftSize;
			let x = 0;

			for (let i = 0; i < analyser.fftSize; i++) {
				const v = dataArray[i] * 50.0;
				const y = -v + canvas.height / 2;

				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}

				x += sliceWidth;
			}

			context.lineTo(canvas.width, canvas.height / 2);
			context.stroke();
		};

		draw();
	},
	draw3xOsc(oscillator) {
		imageContext.fillStyle = "rgb(200, 200, 200)";
		imageContext.fillRect(0, 0, imageCanvas.width, imageCanvas.height);

		imageContext.lineWidth = 2;
		imageContext.strokeStyle = "rgb(0, 0, 0)";

		imageContext.beginPath();

		const sliceWidth = imageCanvas.width / 1000;
		let x = 0;

		for (let i = 0; i <= 1000; i++) {
			const amt = (i / 1000) * 2 * Math.PI;
			const osc1 = oscillator.osc1;
			const osc2 = oscillator.osc2;
			const osc3 = oscillator.osc3;
			const {gain1, gain2, gain3} = oscillator.getGains();

			const wav1 = funcs[osc1.type](amt * Math.pow(2, osc1.octave + 2));
			const wav2 = funcs[osc2.type](amt * Math.pow(2, osc2.octave + 2));
			const wav3 = funcs[osc3.type](amt * Math.pow(2, osc3.octave + 2));

			const combine = wav1 * gain1 + wav2 * gain2 + wav3 * gain3;
			const value = combine * 20;
			const y = -value + imageCanvas.height / 2;

			if (i === 0) {
				imageContext.moveTo(x, y);
			} else {
				imageContext.lineTo(x, y);
			}

			x += sliceWidth;
		}

		imageContext.stroke();
		return imageCanvas.toDataURL();
	},
};
