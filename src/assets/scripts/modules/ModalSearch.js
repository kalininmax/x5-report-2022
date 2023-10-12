import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
// import dom from '../utils/dom';
import Signal from '../classes/Signal';
import KeypressHelper from '../helpers/KeypressHelper';
import FormSearch from '../../../includes/form-search/form-search';
import env from '../utils/env';

const dom = {
	$body: $('body'),
	$html: $('html'),
	$document: $(document),
	$window: $(window),
};

const jqFormSearch = $(FormSearch)[0];

const MODAL_SEARCH_OPENED_CLASS = '_opened';

const MESSAGES = {
	en: {
		noResults: 'No results found',
		moreLetters: 'Please, enter more letters',
		results: 'Results',
	},
	ru: {
		noResults: 'Ничего не найдено',
		moreLetters: 'Пожалуйста, введите больше символов',
		results: 'Результатов',
	},
};

class ModalSearch {
	constructor() {
		this.lang = dom.$html.attr('lang') || 'en';
		this.dataLocation = env.isEn
			? './assets/jsons/search-data-en.json'
			: '../assets/jsons/search-data-ru.json';

		// DOM
		this.$modalSearch = dom.$body.find('.modal-search');
		this.$body = this.$modalSearch.find('.modal-search__body');
		this.$form = this.$modalSearch.find('.modal-search__form');
		this.$field = this.$modalSearch.find('.modal-search__field');
		this.$buttonClear = this.$modalSearch.find('.modal-search__button-clear');
		this.$message = this.$modalSearch.find('.modal-search__message');
		this.$results = this.$modalSearch.find('.modal-search__results');
		this.$overlay = this.$modalSearch.find('.modal-search__overlay');

		this.$resultTmpl = $(
			document.getElementById('tmpl-search-result').content
		).find('.modal-search__result');

		// Binds
		KeypressHelper.onEscKey.add(() => this.close());
		dom.$body.on('click', '[data-modal-search-close]', () => this.close());

		this.$modalSearch.on('transitionend', (evt) => {
			if (evt.target === evt.currentTarget) {
				if (!this.opened) {
					enableBodyScroll(this.$modalSearch[0]);
					this.$modalSearch.hide();
					this.$field.val('');
					this.$results.html('');
				}
			}
		});

		this.$form.on('submit', (evt) => evt.preventDefault());

		this.$field.on('input', () => {
			this.setVisibleButtonClear();
			clearTimeout(this.submitTimeout);

			this.submitTimeout = setTimeout(() => {
				this.submit();
			}, 500);
		});

		this.$buttonClear.on('click', () => {
			this.clear();
		});

		// Signals
		this.onOpen = new Signal();
		this.onClose = new Signal();
		this.onSubmit = new Signal();

		jqFormSearch.onSubmit.add(() => {
			this.$field.val(jqFormSearch.$field.value.trim());
			this.setVisibleButtonClear();
			this.open();
			this.submit();
		});
	}

	open() {
		this.opened = true;
	}

	close() {
		this.opened = false;
	}

	escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	submit() {
		this.term = this.$field.val().trim();

		const termLength = this.term.length;

		if (termLength >= 3) {
			this.showOverlay();
			const searchRegExpG = new RegExp(
				`(${this.escapeRegExp(this.term)})`,
				'gi'
			);
			fetch(this.dataLocation).then((response) => {
				this.showOverlay(false);
				this.clearResults();
				let hits = [];
				if (response.ok) {
					response
						.json()
						.then((data) => ({
							data: data,
							status: response.status,
						}))
						.then((res) => {
							const searchData = res.data;
							hits = searchData
								.map(([element, text, page]) => [
									element,
									text,
									page,
									text.match(searchRegExpG),
								])
								.filter(([, , , matches]) => matches)
								.map(([element, text, page, matches]) => [
									element,
									text,
									page,
									matches.length,
								]);
							return hits;
						})
						.then((results) => {
							if (hits.length > 0) {
								hits.forEach((resultItem) => {
									const resultId = resultItem[0];
									const resultText = resultItem[1];
									const resultPage = resultItem[2];
									const baseUrl = env.isEn ? '/' : '/ru/';

									this.setMessage(
										`${MESSAGES[this.lang].results}: ${results.length}`
									);

									const $resultElt = this.$resultTmpl.clone();

									let link;

									if (resultPage === 'htmlPage1') {
										link = `${baseUrl}#${resultId}`;
									} else if (resultPage === 'htmlPage2') {
										link = `${baseUrl}corporate-governance.html#${resultId}`;
									} else if (resultPage === 'htmlPage3') {
										link = `${baseUrl}financial-statements.html#${resultId}`;
									} else if (resultPage === 'htmlPage4') {
										link = `${baseUrl}annex.html#${resultId}`;
									}

									const from = resultText.search(
										resultText.match(searchRegExpG)[0]
									);
									const to = resultText.length;
									const textSliced = resultText
										.substring(from, to)
										.replace(
											resultText.match(searchRegExpG)[0],
											`<span class="modal-search__result-highlited">${
												resultText.match(searchRegExpG)[0]
											}</span>`
										);
									let visibleText;
									textSliced.length > 269
										? (visibleText = `...${textSliced.slice(0, 269)}...`)
										: (visibleText = `...${textSliced}...`);

									$resultElt.attr('href', link);
									$resultElt
										.find('.modal-search__result-title')
										.html(visibleText);

									this.$results.append($resultElt);
									$resultElt.on('click', () => {
										this.close();
									});
								});
							} else {
								this.setMessage(MESSAGES[this.lang].noResults);
							}
						})
						.catch((err) => {
							this.showOverlay(false);
							this.clearResults();
							this.setMessage(err);
						});
				} else {
					this.setMessage(MESSAGES[this.lang].noResults);
					throw new Error('HTTP Error: ' + response.status);
				}
			});

			this.onSubmit.call();
		} else if (termLength > 0) {
			this.clearResults();
			this.setMessage(MESSAGES[this.lang].moreLetters);
		} else {
			this.clearResults();
			this.setMessage('');
		}
	}

	clearField() {
		this.$field.val('');
		this.setVisibleButtonClear();
	}

	clearResults() {
		this.$results.html('');
	}

	clear() {
		this.clearField();
		this.clearResults();
		this.setMessage('');
	}

	setMessage(str) {
		this.$message.text(str);
	}

	setVisibleButtonClear() {
		this.$buttonClear.toggleClass('_hidden', !this.$field.val());
	}

	showOverlay(val = true) {
		this.$overlay.toggleClass('_hidden', !val);
	}

	get opened() {
		return this.$modalSearch.hasClass(MODAL_SEARCH_OPENED_CLASS);
	}

	set opened(val) {
		if (val !== this.opened) {
			if (val) {
				disableBodyScroll(this.$modalSearch[0], {
					reserveScrollBarGap: true,
				});

				this.$modalSearch.show();

				this.animationFrame = requestAnimationFrame(() => {
					this.$modalSearch.addClass(MODAL_SEARCH_OPENED_CLASS);
				});

				this.onOpen.call();
			} else {
				this.$modalSearch.removeClass(MODAL_SEARCH_OPENED_CLASS);
				this.onClose.call();
			}
		}
	}
}

export default new ModalSearch();
