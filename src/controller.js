const topRow = "q2w3er5t6y7ui9o0p";
const bottomRow = "zsxdcvgbhnjm,l.;/";

const keyElements = {};

function createKey(className, key) {
	const element = document.createElement("div");
	element.className = className;
	const innerElement = document.createElement("div");
	innerElement.innerText = key;
	element.append(innerElement);

	keyElements[key] = element;

	return element;
}

function createKeys(element, row) {
	element.append(createKey("white-key", row[0]));
	element.append(createKey("black-key", row[1]));
	element.append(createKey("white-key", row[2]));
	element.append(createKey("black-key", row[3]));
	element.append(createKey("white-key", row[4]));
	element.append(createKey("white-key", row[5]));
	element.append(createKey("black-key", row[6]));
	element.append(createKey("white-key", row[7]));
	element.append(createKey("black-key", row[8]));
	element.append(createKey("white-key", row[9]));
	element.append(createKey("black-key", row[10]));
	element.append(createKey("white-key", row[11]));
	element.append(createKey("white-key", row[12]));
	element.append(createKey("black-key", row[13]));
	element.append(createKey("white-key", row[14]));
	element.append(createKey("black-key", row[15]));
	element.append(createKey("white-key", row[16]));
}

module.exports = {
	setup() {
		createKeys(document.getElementById("top-row"), topRow);
		createKeys(document.getElementById("bottom-row"), bottomRow);
	},
	startKey(key) {
		keyElements[key].classList.add("pressed");
	},
	stopKey(key) {
		keyElements[key].classList.remove("pressed");
	},
};
