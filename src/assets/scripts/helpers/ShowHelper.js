import utils from '../utils/utils';

const IGNORE_WINDOW_WIDTH = true;

function ShowHelper2() {
	this.listeners = [];
	this.viewportScale = 1;
	this.started = false;

	// eslint-disable-line no-unused-vars
	/* eslint-disable */
	window.addEventListener(
		'resize',
		(e) => {
			this.update(true);
		},
		true
	);

	window.addEventListener(
		'scroll',
		() => {
			this.update();
		},
		true
	);

	/* eslint-enable */
}

ShowHelper2.prototype = {
	start() {
		this.started = true;
		this.update(true);
	},
	stop() {
		this.started = false;
	},
	watch(targets, handler, hitFlag, alwaysUpdate) {
		if (!Array.isArray(targets)) {
			targets = [targets];
		}
		const totalTargets = targets.length;
		for (let k = 0; k < totalTargets; k++) {
			this.watchSingle(targets[k], handler, hitFlag, alwaysUpdate);
		}
	},
	staggerWatch(targets, handler, hitFlag, alwaysUpdate, staggerTime) {
		if (!staggerTime || staggerTime === 0) {
			return this.watch(targets, handler, hitFlag, alwaysUpdate);
		}
		if (!Array.isArray(targets)) {
			targets = [targets];
		}
		let prevTime = 0;
		targets.forEach((elem) => {
			this.watchSingle(
				elem,
				(state, target) => {
					if (state) {
						let delay = 0;
						const now = utils.now();
						const timeDistance = now - prevTime;

						if (timeDistance < staggerTime) {
							delay = staggerTime - timeDistance;
						}

						prevTime = now + delay;

						setTimeout(() => {
							handler.apply(target, [true, target]);
						}, delay);
					} else {
						handler.apply(target, [false, target]);
					}
				},
				hitFlag,
				alwaysUpdate
			);
		});
		return null;
	},
	unwatch(targets) {
		if (!Array.isArray(targets)) {
			targets = [targets];
		}
		const totalTargets = targets.length;
		for (let k = 0; k < totalTargets; k++) {
			this.unwatchSingle(targets[k]);
		}
	},
	watchSingle(target, handler, hitFlag, alwaysUpdate) {
		const listener = {
			target: target,
			handler: handler,
			hitFlag: hitFlag,
			alwaysUpdate: !!alwaysUpdate,
		};

		this.listeners.push(listener);

		this._checkListener(listener, true);
	},
	unwatchSingle(target) {
		const totalListeners = this.listeners.length;
		for (let k = 0; k < totalListeners; k++) {
			if (this.listeners[k].target === target) {
				this.listeners.splice(k, 1);
				this.hasUnwatchAction = true;
				return;
			}
		}
	},
	update(forced) {
		if (!this.started) {
			return;
		}

		if (forced) {
			const width = IGNORE_WINDOW_WIDTH ? 9999999 : window.innerWidth;
			const height = window.innerHeight;
			const viewWidth = IGNORE_WINDOW_WIDTH
				? width
				: width * this.viewportScale;
			const viewHeight = height * this.viewportScale;

			this.viewportLeft = (width - viewWidth) / 2;
			this.viewportRight = width - this.viewportLeft;
			this.viewportTop = (height - viewHeight) / 2;
			this.viewportBottom = height - this.viewportTop;
		}

		this.pageX = IGNORE_WINDOW_WIDTH
			? 0
			: Math.max(window.pageXOffset, document.body.scrollLeft);
		this.pageY = Math.max(window.pageYOffset, document.body.scrollTop);

		this.hasUnwatchAction = false;
		let testedListener;
		const totalListeners = this.listeners.length;
		for (let k = 0; k < totalListeners; k++) {
			const listener = this.listeners[k];
			if (listener && listener !== testedListener) {
				this._checkListener(this.listeners[k], forced);
				testedListener = listener;
			}
			if (this.hasUnwatchAction) {
				k--;
				this.hasUnwatchAction = false;
			}
		}
		this.hasUnwatchAction = false;
	},
	setViewpostScale(scale) {
		this.viewportScale = scale;
		this.update(true);
	},
	_checkListener(listener, forced) {
		if (!this.started) {
			return;
		}

		if (forced || !listener.boundingRect || listener.alwaysUpdate) {
			const boundingClientRect = listener.target.getBoundingClientRect();
			listener.boundingRect = {
				top: boundingClientRect.top + this.pageY,
				bottom: boundingClientRect.bottom + this.pageY,
				left: boundingClientRect.left + this.pageX,
				right: boundingClientRect.right + this.pageX,
			};
		}
		const bBox = listener.boundingRect;

		let visibleState = false;
		if (listener.hitFlag) {
			visibleState =
				bBox.left < this.viewportRight + this.pageX &&
				bBox.right > this.viewportLeft + this.pageX &&
				bBox.top < this.viewportBottom + this.pageY &&
				bBox.bottom > this.viewportTop + this.pageY;
		} else {
			visibleState =
				bBox.left >= this.viewportLeft + this.pageX &&
				bBox.right <= this.viewportRight + this.pageX &&
				bBox.top >= this.viewportTop + this.pageY &&
				bBox.bottom <= this.viewportBottom + this.pageY;
		}
		if (listener.state !== visibleState) {
			listener.state = visibleState;
			listener.handler.apply(listener.target, [visibleState, listener.target]);
		}
	},
};

export default new ShowHelper2();
