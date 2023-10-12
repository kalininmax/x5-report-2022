import dom from '../utils/dom';
import env from '../utils/env';
import Signal from '../classes/Signal';

function KeypressHelper() {
	this.onEscKey = new Signal();
	this.onUpKey = new Signal();
	this.onDownKey = new Signal();

	if (!env.isDesktop) {
		return;
	}

	dom.$window.addEventListener('keyup', (e) => {
		const keyCode = e.keyCode;

		keyCode === 27 && this.onEscKey.call();
		keyCode === 38 && this.onUpKey.call();
		keyCode === 40 && this.onDownKey.call();
	});
}

KeypressHelper.prototype = {};

export default new KeypressHelper();
