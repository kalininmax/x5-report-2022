import dom from '../../assets/scripts/utils/dom';
import Signal from '../../assets/scripts/classes/Signal';
import KeypressHelper from '../../assets/scripts/helpers/KeypressHelper';

const FORM_SEARCH_OPENED_CLASS = '_opened';

class FormSearch {
	constructor() {
		// DOM
		this.$formSearch = document.querySelector('.form-search');
		this.$form = document.querySelector('.form-search__form');
		this.$field = document.querySelector('.form-search__field');
		this.opener = document.querySelector('[data-form-search-open]');
		this.closer = document.querySelector('[data-form-search-close]');

		// Binds
		dom.$body.addEventListener('click', (evt) => {
			if (
				evt.target !== this.$formSearch &&
				!this.$formSearch.contains(evt.target)
			) {
				this.close();
			}
		});

		KeypressHelper.onEscKey.add(() => this.close());
		this.opener.addEventListener('click', () => this.open());
		this.closer.addEventListener('click', () => this.close());

		this.$formSearch.addEventListener('transitionend', (evt) => {
			if (evt.target === evt.currentTarget) {
				if (this.opened) {
					this.$field.focus();
				} else {
					this.$formSearch.style.display = 'none';
					this.$field.value = '';
				}
			}
		});

		this.$form.addEventListener('submit', (evt) => {
			evt.preventDefault();

			if (this.$field.value !== '') {
				this.onSubmit.call();
				this.close();
			}
		});

		// Signals
		this.onOpen = new Signal();
		this.onClose = new Signal();
		this.onSubmit = new Signal();
	}

	open() {
		this.opened = true;
	}

	close() {
		this.opened = false;
	}

	get opened() {
		return this.$formSearch.classList.contains(FORM_SEARCH_OPENED_CLASS);
	}

	set opened(val) {
		if (val !== this.opened) {
			if (val) {
				// this.$formSearch.show();
				this.$formSearch.style.display = 'flex';

				this.animationFrame = requestAnimationFrame(() => {
					this.$formSearch.classList.add(FORM_SEARCH_OPENED_CLASS);
				});

				this.onOpen.call();
			} else {
				this.$formSearch.classList.remove(FORM_SEARCH_OPENED_CLASS);
				this.onClose.call();
			}
		}
	}
}

export default new FormSearch();
