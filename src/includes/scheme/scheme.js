class Scheme {
	constructor() {
		this.anchors = document.querySelectorAll('[data-scheme-anchor]');

		if (!this.anchors) {
			return;
		}

		this.init();
	}
	init() {
		this.anchors.forEach((anchor) => {
			anchor.addEventListener('click', (e) => {
				const value = e.target.dataset.schemeAnchor;
				const el = document.querySelector(`#${value}`);
				el.scrollIntoView({ behavior: 'smooth' });
			});
		});
	}
}

export default new Scheme();
