import Signal from '../classes/Signal';
import Utils from '../utils/utils';
const dom = require('../utils/dom');
const env = require('../utils/env');

const SCROLLED_CLASS = '_scrolled';
const SCROLLED_OFFSET = 80;
const TOUCH_DELTA_TOLERANCE = 20;
const TOUCH_DIAGONAL_TOLERANCE = 40;
const DOWN = 'down';
const UP = 'up';
const RIGHT = 'right';
const LEFT = 'left';
const CURRENT = 'current';
const DEFAULT_POINTERS_ELEMENT = dom.$body;
const NEED_TO_FIX_MOUSEWHEEL = env.isFF;
const WHEEL_DELTA_TOLERANCE = 20;

function ScrollHelper() {
	this.onScroll = new Signal();
	this.onDirectionChange = new Signal();
	this.onScrollUp = new Signal();
	this.onScrollDown = new Signal();
	this.onScrollLeft = new Signal();
	this.onScrollRight = new Signal();

	this.getCurrentScrollTop();
	this.lastScrollTop = this.currentScrollTop;
	this.currentScrollDirection = CURRENT;
	this.lastTouchX = null;
	this.lastTouchY = null;
	this.standartDetectionState = true;

	dom.$window.addEventListener('scroll', () => {
		if (!this.standartDetectionState) {
			return;
		}

		this.getCurrentScrollTop();

		if (this.currentScrollTop > SCROLLED_OFFSET) {
			dom.$html.classList.add(SCROLLED_CLASS);
		} else {
			dom.$html.classList.remove(SCROLLED_CLASS);
		}

		this.onScroll.call(this.currentScrollTop);
		this._directionController();
	});

	this.onScrollDown.add(() => this._setDirection(DOWN));
	this.onScrollUp.add(() => this._setDirection(UP));
}

ScrollHelper.prototype = {
	getCurrentScrollTop() {
		const currentScrollTop = Utils.getCurrentScrollTop();
		this.currentScrollTop = currentScrollTop;
		return currentScrollTop;
	},

	_directionController() {
		let direction;
		const currentScrollTop = this.currentScrollTop;
		const lastScrollTop = this.lastScrollTop;

		if (currentScrollTop > lastScrollTop) {
			direction = DOWN;
		} else if (currentScrollTop < lastScrollTop) {
			direction = UP;
		} else {
			direction = CURRENT;
		}

		this.lastScrollTop = this.currentScrollTop;
		if (this.currentScrollDirection === direction) {
			return;
		}

		this.currentScrollDirection = direction;
		this.onDirectionChange.call(direction);
		if (direction === UP) {
			this.onScrollUp.call();
		} else if (direction === DOWN) {
			this.onScrollDown.call();
		}
	},

	_setDirection(direction) {
		if (
			(direction !== CURRENT && direction !== UP && direction !== DOWN) ||
			direction === this.currentScrollDirection
		) {
			return;
		}

		this.currentScrollDirection = direction;
		this.onDirectionChange.call(direction);
	},

	applyAdditionalWatchers(
		$scrollElement = DEFAULT_POINTERS_ELEMENT,
		preventDefault = false
	) {
		const isDefault = $scrollElement.is(DEFAULT_POINTERS_ELEMENT);
		const events = {
			onScrollUp: isDefault ? this.onScrollUp : new Signal(),
			onScrollDown: isDefault ? this.onScrollDown : new Signal(),
			onScrollLeft: isDefault ? this.onScrollLeft : new Signal(),
			onScrollRight: isDefault ? this.onScrollRight : new Signal(),
		};

		// NOTE: Контролируем тачпад-события, которые по типу являются mousewheel,
		// но при этом возникают большое кол-во раз, образуя целую плавно затухающую цепочку событий.
		let _needToPreventWheel = false;
		const debounceDelay = NEED_TO_FIX_MOUSEWHEEL ? 150 : 50;
		const _wheelDebouncedFunction = Utils.debounce(() => {
			_needToPreventWheel = false;
		}, debounceDelay);

		$scrollElement.on(
			'touchstart mousedown touchend mouseup mousewheel wheel',
			(e) => {
				let eType = e.type;
				if (e.type === 'wheel') {
					eType = 'mousewheel';
				}
				const originalEvent = e.originalEvent;
				let pageX;
				let pageY;
				let delta;
				let touchDeltaY;
				let touchDeltaX;

				if (preventDefault && (eType === 'mousedown' || eType === 'mouseup')) {
					e.preventDefault();
				}

				// eslint-disable-next-line default-case
				switch (eType) {
					case 'touchstart':
						this.lastTouchX = originalEvent.changedTouches[0].clientX;
						this.lastTouchY = originalEvent.changedTouches[0].clientY;
						break;

					case 'mousedown':
						this.lastTouchX = originalEvent.clientX;
						this.lastTouchY = originalEvent.clientY;
						break;

					case 'touchend':
					case 'mouseup':
						if (eType === 'touchend') {
							pageX = originalEvent.changedTouches[0].clientX;
							pageY = originalEvent.changedTouches[0].clientY;
						} else {
							pageX = originalEvent.clientX;
							pageY = originalEvent.clientY;
						}

						// Prevent diagonal directions
						touchDeltaY = Math.abs(pageY - this.lastTouchY);
						touchDeltaX = Math.abs(pageX - this.lastTouchX);
						if (
							touchDeltaY > TOUCH_DELTA_TOLERANCE &&
							touchDeltaX > TOUCH_DELTA_TOLERANCE &&
							Math.abs(touchDeltaY - touchDeltaX) <= TOUCH_DIAGONAL_TOLERANCE
						) {
							break;
						}

						if (pageY > this.lastTouchY + TOUCH_DELTA_TOLERANCE) {
							events.onScrollUp.call();
						} else if (pageY < this.lastTouchY - TOUCH_DELTA_TOLERANCE) {
							events.onScrollDown.call();
						}

						if (pageX > this.lastTouchX + TOUCH_DELTA_TOLERANCE) {
							events.onScrollLeft.call();
						} else if (pageX < this.lastTouchX - TOUCH_DELTA_TOLERANCE) {
							events.onScrollRight.call();
						}
						break;

					case 'mousewheel':
						delta =
							originalEvent.deltaY ||
							originalEvent.detail ||
							originalEvent.wheelDelta;
						_wheelDebouncedFunction();

						// NOTE: У Лисы (возможно, что ещё у некоторых других браузеров)
						// события от колеса мышки генерируют малое (по модулю) значение delta,
						// которое мы отсекаем, и,&nbsp;в&nbsp;итоге, колесо как будто бы не работает.
						// Поэтому слегка шаманим со значением delta.
						if (NEED_TO_FIX_MOUSEWHEEL && !_needToPreventWheel) {
							delta *= WHEEL_DELTA_TOLERANCE;
						}

						// NOTE: Отсекаем мелкие тачпад-события.
						if (Math.abs(delta) < WHEEL_DELTA_TOLERANCE) {
							return;
						}

						// NOTE: Отсекаем все лишние тачпад-события,
						// из&#8209;за которых может происходить мультискролл.
						if (_needToPreventWheel) {
							return;
						}
						_needToPreventWheel = true;

						if (delta > 0) {
							events.onScrollDown.call();
						} else if (delta < 0) {
							events.onScrollUp.call();
						}
						break;
				}
			}
		);

		return events;
	},
	setStandartDetectionState(state) {
		this.standartDetectionState = !!state;
	},
};

const instance = new ScrollHelper();
instance.UP = UP;
instance.DOWN = DOWN;
instance.RIGHT = RIGHT;
instance.LEFT = LEFT;
instance.CURRENT = CURRENT;

export default instance;
