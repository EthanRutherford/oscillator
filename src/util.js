module.exports = {
	merge(...sources) {
		return Object.assign({}, ...sources);
	},
	clamp(val, min, max) {
		return Math.min(Math.max(min, val), max);
	},
};
