import gsap from 'gsap';
import ShowHelper2 from '../helpers/ShowHelper';
import utils from '../utils/utils';

class Effects {
	constructor() {
		ShowHelper2.setViewpostScale(1);
		this.animationTargets = document.querySelectorAll(
			'section .container > div'
		);
		this.animationTargets.forEach((target) => {
			if (!utils.isAnyPartOfElementInViewport(target)) {
				target.classList.add('_fade-up');
			}
		});

		function animate(target) {
			const attrValue = '_animated';

			if (attrValue === '') {
				return console.warn('Empty data-animation attribute value');
			}

			const settings = attrValue.trim().split(',');
			const cssClass = settings[0].trim();

			if (cssClass && cssClass.length) {
				target.classList.add('_zero-ease');
				target.classList.remove(cssClass);

				const delay = parseFloat(settings[1] || '');
				const multipleFlag = (settings[2] || '').trim();

				gsap.delayedCall((Number.isNaN(delay) ? 0 : delay) + 0.01, () => {
					target.classList.remove('_zero-ease');
					target.classList.add(cssClass);
				});

				if (!multipleFlag) {
					ShowHelper2.unwatch(target);
					target.removeAttribute('data-animation');
				}
			}

			return null;
		}
		ShowHelper2.staggerWatch(
			Array.from(this.animationTargets),
			(state, target) => {
				if (state) {
					animate(target);
				}
			},
			true,
			true,
			55
		);
	}
}

export default new Effects();
