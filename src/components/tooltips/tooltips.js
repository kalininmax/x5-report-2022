import tippy from 'tippy.js';

class Tooltips {
	constructor() {
		const tooltipsTriggers = Array.from(
			document.querySelectorAll('[data-tooltip-id]') || []
		);

		tooltipsTriggers.forEach((trigger) => {
			try {
				const tooltip = document.getElementById(trigger.dataset.tooltipId);
				const width = trigger.dataset.tooltipWidth;
				tippy(trigger, {
					content: tooltip.innerHTML,
					allowHTML: true,
					maxWidth: width ? +width : 350,
					placement: 'top',
					animation: 'fade',
					interactive: true,
					appendTo: () => document.body,
					popperOptions: {
						modifiers: [
							{
								name: 'offset',
								options: {
									offset: [5, 5],
								},
							},
						],
					},
				});
			} catch {
				const id = trigger.dataset.tooltipId;
				const tooltip = document
					.querySelector('.tooltips')
					.querySelector(`#${trigger.dataset.tooltipId}`);

				if (!tooltip) {
					console.log(`Текста для тултипа с id ${id} не существует`);
				}
			}
		});
	}
}

export default new Tooltips();
