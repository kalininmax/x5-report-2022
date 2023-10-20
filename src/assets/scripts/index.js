import { gsap } from 'gsap';

window.gsap = gsap;
window.$ = window.jQuery = require('jquery');

gsap.defaults({
	overwrite: 'auto',
});

class ProjectApp {
	constructor() {
		this.env = require('./utils/env').default;
		this.dom = require('./utils/dom').default;
		this.utils = require('./utils/utils').default;
		this.classes = {
			Signal: require('./classes/Signal').default,
		};
		this.components = {
			Header: require('../../includes/header/header').default,
			Menu: require('../../components/menu/menu').default,
			Preloader: require('../../includes/preloader/preloader').default,
			Tooltips: require('../../components/tooltips/tooltips').default,
			Scheme: require('../../includes/scheme/scheme').default,
		};
		this.helpers = {
			KeypressHelper: require('./helpers/KeypressHelper'),
			ScrollHelper: require('./helpers/ScrollHelper'),
			ShowHelper: require('./helpers/ShowHelper').default,
		};
		this.modules = {
			// HeaderScrollSpy: require('./modules/HeaderScrollSpy').default,
			// Effects: require('./modules/Effects').default,
			// BlockSwitcher: require('./modules/BlockSwitcher').default,
			// Accordion: require('./modules/Accordion').default,
			// StopCopy: require('./modules/StopCopy').default,
		};
		document.addEventListener('DOMContentLoaded', () => {
			document.documentElement.classList.remove('_loading');
			setTimeout(
				this.components.Preloader.hide.bind(this.components.Preloader),
				750
			);
			this.helpers.ShowHelper.start();
		});
	}
}

window.ProjectApp = new ProjectApp();
