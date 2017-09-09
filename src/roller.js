const {PureComponent} = require("react");
const PropTypes = require("prop-types");
const j = require("react-jenny");
require("../styles/roller.css");
const {clamp} = require("./util");

const RollerProp = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.shape({
		display: PropTypes.string.isRequired,
		value: PropTypes.string.isRequired,
	}),
]);
const getValue = (item) => item instanceof Object ? item.value : item;
const getDisplay = (item) => item instanceof Object ? item.display : item;

const RollerItem = (props) => j({div: {
	className: "roller-item",
	style: {top: `${props.index * 100}%`},
}}, getDisplay(props.item));

RollerItem.propTypes = {
	item: RollerProp.isRequired,
	index: PropTypes.number.isRequired,
};

class Roller extends PureComponent {
	componentWillMount() {
		this.mouseDown = this.mouseDown.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		this.touchStart = this.touchStart.bind(this);
		this.touchMove = this.touchMove.bind(this);
		this.touchEnd = this.touchEnd.bind(this);
		this.rollerRef = (ref) => this.roller = ref;

		this._currentTouch = null;
		this._internalValue = this.props.items.findIndex(
			(item) => this.props.value === getValue(item),
		);

		this.state = {
			displayValue: this._internalValue,
		};
	}
	componentWillUnmount() {
		window.removeEventListener("mousemove", this.mouseMove);
		window.removeEventListener("mouseup", this.mouseUp);
		window.removeEventListener("touchmove", this.touchMove);
		window.removeEventListener("touchend", this.touchEnd);
	}
	handleMove(amt) {
		const pct = amt / this.roller.offsetHeight;
		this._internalValue = clamp(
			this._internalValue + pct,
			0,
			this.props.items.length - 1,
		);

		const index = Math.round(this._internalValue);
		const newValue = getValue(this.props.items[index]);

		if (newValue !== this.props.value) {
			this.props.onChange(newValue);
		}

		this.setState({displayValue: this._internalValue});
	}
	mouseDown(event) {
		if (event.button === 0) {
			event.preventDefault();
			window.addEventListener("mousemove", this.mouseMove);
			window.addEventListener("mouseup", this.mouseUp);
		}
	}
	mouseMove(event) {
		this.handleMove(-event.movementY);
	}
	mouseUp(event) {
		if (event.button === 0) {
			window.removeEventListener("mousemove", this.mouseMove);
			window.removeEventListener("mouseup", this.mouseUp);

			this._internalValue = Math.round(this._internalValue);
			this.setState({displayValue: this._internalValue});
		}
	}
	touchStart(event) {
		if (this._currentTouch == null) {
			const touch = event.changedTouches[0];
			this._currentTouch = touch;

			window.addEventListener("touchmove", this.touchMove);
			window.addEventListener("touchend", this.touchEnd);
		}
	}
	touchMove(event) {
		let curTouch;
		for (const touch of event.changedTouches) {
			if (touch.identifier === this._currentTouch.identifier) {
				curTouch = touch;
			}
		}

		if (!curTouch) {
			return;
		}

		this.handleMove(this._currentTouch.pageY - curTouch.pageY);
		this._currentTouch = curTouch;
	}
	touchEnd(event) {
		let curTouch;
		for (const touch of event.changedTouches) {
			if (touch.identifier === this._currentTouch.identifier) {
				curTouch = touch;
			}
		}

		if (!curTouch) {
			return;
		}

		this._currentTouch = null;

		window.removeEventListener("touchmove", this.touchMove);
		window.removeEventListener("touchend", this.touchEnd);

		this._internalValue = Math.round(this._internalValue);
		this.setState({displayValue: this._internalValue});
	}
	render() {
		const transform = `translateY(${-this.state.displayValue * 100}%)`;

		return j({div: {
			className: `roller ${this.props.className}`,
			onMouseDown: this.mouseDown,
			onTouchStart: this.touchStart,
			ref: this.rollerRef,
		}}, [
			j({div: {
				className: "roller-container",
				style: {transform},
			}}, [
				...this.props.items.map((item, i) => j([RollerItem, {
					item,
					index: i,
					key: getValue(item),
				}])),
			]),
		]);
	}
}

Roller.propTypes = {
	className: PropTypes.string,
	items: PropTypes.arrayOf(RollerItem).isRequired,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
};

module.exports = Roller;
