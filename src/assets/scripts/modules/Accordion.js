class Accordion {
	constructor() {
		this.buttons = document.querySelectorAll('[data-accordion]');
		this.panels = document.querySelectorAll('[data-panel]');
		this.resizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.target.style.maxHeight) {
					entry.target.style.maxHeight = `${entry.target.scrollHeight}px`;
				}
			});
		});

		this.buttons.forEach((button) => {
			button.addEventListener('click', () =>
				this.togglePanel(button.dataset.accordion)
			);
		});

		this.panels.forEach((panel) => {
			this.resizeObserver.observe(panel);
		});
	}

	togglePanel(accordionId) {
		const button = document.querySelector(`[data-accordion="${accordionId}"]`);
		const panel = document.querySelector(`[data-panel="${accordionId}"]`);
		button.classList.toggle('_active');
		panel.style.maxHeight = panel.style.maxHeight
			? null
			: `${panel.scrollHeight}px`;
	}
}

export default new Accordion();
