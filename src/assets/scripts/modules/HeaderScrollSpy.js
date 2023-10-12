import gsap from 'gsap';
import Signal from '../classes/Signal';
import ScrollHelper from '../helpers/ScrollHelper';
import Utils from '../utils/utils';
import ENV from '../utils/env';

const lang = document.documentElement.lang;

const DATA = {
	'/': {
		pageName: {
			ru: 'Стратегический отчёт',
			en: 'Strategic Report',
		},
		list: [
			{ sectionId: 'overview' },
			{ sectionId: 'our-approach' },
			{ sectionId: 'sustainability-goals' },
			{ sectionId: 'key-highlights' },
			{ sectionId: 'financial-operating-highlights' },
			{ sectionId: 'key-highlights' },
			{ sectionId: 'business-model' },
			{ sectionId: 'our-formats' },
			{ sectionId: 'russias-food-retail-market' },
			{ sectionId: 'trends-in-economy-and-consumer-behaviour' },
			{ sectionId: 'legislative-changes' },
			{ sectionId: 'ceo-statement' },
			{ sectionId: 'our-strategy' },
			{ sectionId: 'geography-of-operations' },
			{ sectionId: 'leadership-team' },
			{ sectionId: 'pyaterochka' },
			{ sectionId: 'perekrestok' },
			{ sectionId: 'chizhik' },
			{ sectionId: 'karusel' },
			{ sectionId: 'krasny-yar-and-slata' },
			{ sectionId: 'x5-club' },
			{ sectionId: 'paket' },
			{ sectionId: 'x5-digital' },
			{ sectionId: 'express-delivery' },
			{ sectionId: 'mnogo-lososya' },
			{ sectionId: 'five-post' },
			{ sectionId: 'food' },
			{ sectionId: 'logistics-and-transport' },
			{ sectionId: 'direct-imports' },
			{ sectionId: 'x5-technologies' },
			{ sectionId: 'innovations' },
			{ sectionId: 'financial-review' },
			{ sectionId: 'information-on-alternative-performance-measures' },
			{ sectionId: 'sustainability-strategy' },
			{ sectionId: 'sustainability-management' },
			{ sectionId: 'stakeholder' },
			{ sectionId: 'community' },
			{ sectionId: 'planet' },
			{ sectionId: 'health' },
			{ sectionId: 'employees' },
		],
	},
	'/corporate-governance.html': {
		pageName: {
			ru: 'Корпоративное управление',
			en: 'Corporate governance',
		},
		list: [
			{ sectionId: 'corporate-governance' },
			{ sectionId: 'supervisory-letter' },
			{ sectionId: 'corporate-report' },
			{ sectionId: 'governance-structure' },
			{ sectionId: 'committees-supervisory-board' },
			{ sectionId: 'shareholders-rights' },
			{ sectionId: 'auditor' },
			{ sectionId: 'compliance-dutch' },
			{ sectionId: 'manage-risk' },
			{ sectionId: 'manage-risk-content' },
			{ sectionId: 'supervisory-management-boards' },
			{ sectionId: 'report-supervisory-board' },
			{ sectionId: 'board-evaluation' },
			{ sectionId: 'meetings-committees' },
			{ sectionId: 'independence-remuneration' },
			{ sectionId: 'remuneration-report' },
		],
	},
	'/financial-statements.html': {
		pageName: {
			ru: 'Финансовая отчетность',
			en: 'Financial statements',
		},
		list: [
			{ sectionId: 'consolidated-financial' },
			{ sectionId: 'consolidated-financial-notes' },
			{ sectionId: 'company-financial-statements' },
			{ sectionId: 'notes-to-the-company-financial-statements' },
			{ sectionId: 'other-financial-information' },
		],
	},
};

const DEFAULT_TIME = 0.4;

function HeaderScrollSpy() {
	this.currentPage = window.location.pathname;

	if (lang === 'ru') {
		this.currentPage = this.currentPage.replace(/\/ru/, '');
	}

	if (!DATA[this.currentPage]) {
		this.enable = false;
		return;
	}
	this.enable = ENV.isDesktop;
	this.sectionsData = DATA[this.currentPage].list;
	this.pageWrapper = document.querySelector('[data-wrapper]');
	this.spyContainer = document.querySelector('[data-header-scroll-spy]');
	this.spyContainerBlock = document.querySelector(
		'[data-header-scroll-spy-text]'
	);
	this.currentSpyText = this.spyContainer.querySelector(
		'[data-header-scroll-spy-current]'
	);
	this.newSpyText = this.spyContainer.querySelector(
		'[data-header-scroll-spy-new]'
	);
	this.currentTitle = null;
	this.pageHeight = 0;

	this.onChangePageHeight = new Signal();

	this.sectionsData.forEach((item) => {
		item.node = document.getElementById(item.sectionId);

		let titleNode = null;
		item.node &&
			(titleNode =
				item.node.querySelector('.h1.visually-hidden') ||
				item.node.querySelector('.h1') ||
				item.node.querySelector('.h2') ||
				item.node.querySelector('.h3') ||
				item.node.querySelector('.partition__text'));
		if (item.node && titleNode && titleNode.textContent) {
			item.title = titleNode.querySelector('p')
				? titleNode.querySelector('p').textContent.trim().toLowerCase()
				: titleNode.textContent.trim().toLowerCase();
			item.title = item.title
				? item.title[0].toUpperCase() + item.title.slice(1)
				: null;
			item.offsetY = (
				item.node.getBoundingClientRect().top -
				document.documentElement.getBoundingClientRect().top
			).toFixed(0);
		} else {
			item.title = null;
			item.offsetY = 0;
		}
	});

	this._init();
}

HeaderScrollSpy.prototype = {
	_init() {
		this._setPageName(DATA[this.currentPage].pageName[lang]);

		ScrollHelper.onScroll.add(
			Utils.throttle(() => {
				if (this.enable) {
					this.setTitle(this._findCurrentTitle());
				}
			}, 1750)
		);
		requestAnimationFrame(
			function test() {
				if (this.enable) {
					this.checkPageHeightDiffs();
					requestAnimationFrame(test.bind(this));
				}
			}.bind(this)
		);
		this.onChangePageHeight.add(this.calcSectionOffsets.bind(this));
	},
	_setPageName(name) {
		this.spyContainer.querySelector(
			'[data-header-scroll-spy-page]'
		).textContent = name;
	},
	calcSectionOffsets() {
		this.sectionsData.forEach((item) => {
			if (item.node) {
				item.offsetY = (
					item.node.getBoundingClientRect().top -
					document.documentElement.getBoundingClientRect().top -
					120
				).toFixed(0);
			}
		});
	},
	checkPageHeightDiffs() {
		const currentHeight = this.pageWrapper.offsetHeight;
		if (currentHeight !== this.pageHeight) {
			this.pageHeight = currentHeight;
			this.onChangePageHeight.call();
		}
	},
	_findCurrentTitle() {
		let title = null;

		for (let i = 0; i <= this.sectionsData.length; i++) {
			if (
				this.sectionsData[i] &&
				ScrollHelper.currentScrollTop > this.sectionsData[i].offsetY
			) {
				continue;
			} else {
				let index = i;
				if (i === 0) {
					break;
				} else {
					index = i - 1;
				}
				title = this.sectionsData[index].title;
				break;
			}
		}
		return title;
	},
	setTitle(title) {
		if (this.currentTitle === title) {
			return;
		}
		if (this.currentTitle === null) {
			this.currentSpyText.textContent = title;
			this.newSpyText.textContent = title;
			gsap.fromTo(
				this.spyContainer,
				{ duration: DEFAULT_TIME, autoAlpha: 0, x: -10 },
				{ autoAlpha: 1, x: 0 }
			);
			this.currentTitle = title;
			return;
		}

		if (title === null) {
			gsap.to(this.spyContainer, { duration: DEFAULT_TIME, autoAlpha: 0 });
			this.currentTitle = title;
			return;
		}

		this.currentTitle = title;

		if (this.gsapTextTimeline && this.gsapTextTimeline.progress() < 1) {
			this.gsapTextTimeline.kill();
		}

		this.gsapTextTimeline = new gsap.timeline()
			.set(this.newSpyText, { autoAlpha: 0 }, '0')
			.to(
				this.currentSpyText,
				{
					duration: 0.35,
					y: -15,
					autoAlpha: 0,
					onComplete: () => {
						this.currentSpyText.textContent = title;
					},
				},
				'0'
			)
			.add(() => {
				this.newSpyText.textContent = title;
			}, '+=0')
			.fromTo(
				this.newSpyText,
				{
					duration: 0.75,
					autoAlpha: 0,
				},
				{
					autoAlpha: 1,
					onComplete: () => {
						gsap.set(this.currentSpyText, { y: 0, autoAlpha: 1 });
					},
				},
				'+=0'
			);
	},
};

export default new HeaderScrollSpy();
