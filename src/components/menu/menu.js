import { gsap } from 'gsap';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import Signal from '../../assets/scripts/classes/Signal';
import env from '../../assets/scripts/utils/env';

const OPEN_CLASS = '_open';

function Menu() {
	this.onOpen = new Signal();
	this.onClose = new Signal();

	this.isBodyScrollLocked = false;

	this.isOpen = false;

	this.menuContainer = document.querySelector('[data-menu]');
	this.burgerButton = document.querySelector('[data-burger-button]');
	this.menuItems = document.querySelectorAll('[data-menu-item]');
	this.submenu = this.menuContainer.querySelector('[data-submenu]');
	this.submenuLists = this.submenu.querySelectorAll('[data-submenu-id]');
	this.submenuBack = this.submenu.querySelector('[data-submenu-back]');
	this.menuLinks = this.menuContainer.querySelectorAll('.submenu__list a');

	this._outsideClickListenerShim = (e) => {
		this._outsideClickListener(e);
	};

	this.burgerButton.addEventListener('click', this.toggle.bind(this));

	this.onOpen.add(this.handleClickOutside, this);

	this.onClose.add(this.removeHandleClickOutside, this);

	this._init();
}

Menu.prototype = {
	_init() {
		this.menuLinks.forEach((link) =>
			link.addEventListener('click', () => {
				this._closeSubmenu();
				this.close();
			})
		);
		if (env.isDesktop) {
			this.menuItems.forEach((link) =>
				link.addEventListener('mouseenter', () => {
					const href = link.getAttribute('href');
					if (!href.includes('annex')) {
						this._openSubmenu.bind(this)(link);
					} else {
						this._closeSubmenu.bind(this)(link);
					}
				})
			);
			this.menuContainer.addEventListener(
				'mouseleave',
				this._closeSubmenu.bind(this)
			);
		}
		if (env.isMobile) {
			this.menuItems.forEach((link) =>
				link.addEventListener('click', (e) => {
					const href = link.getAttribute('href');
					if (!href.includes('annex')) {
						e.preventDefault();
						this._openSubmenu.bind(this)(link);
					} else {
						this._closeSubmenu.bind(this)(link);
						this.close();
					}
				})
			);
			this.menuContainer.addEventListener(
				'mouseleave',
				this._closeSubmenu.bind(this)
			);
		}

		this.submenuBack.addEventListener('click', this._closeSubmenu.bind(this));

		this.onClose.add(() => {
			if (this.isBodyScrollLocked) {
				enableBodyScroll(document.body);
				this.isBodyScrollLocked = false;
			}
		});
	},
	_openSubmenu(event) {
		this.submenu.classList.add(OPEN_CLASS);

		const oldIndex = this.indexActiveSubmenu;
		const newIndex =
			event.dataset.menuItem ||
			event.closest('[data-menu-item]').dataset.menuItem;

		if (oldIndex !== newIndex) {
			this.indexActiveSubmenu = newIndex;
			oldIndex && this.submenuLists[oldIndex].classList.remove(OPEN_CLASS);
			this.submenuLists[newIndex].classList.add(OPEN_CLASS);
		}
	},
	_closeSubmenu() {
		if (this.indexActiveSubmenu) {
			this.submenuLists[this.indexActiveSubmenu].classList.remove(OPEN_CLASS);
		}
		this.indexActiveSubmenu = null;
		this.submenu.classList.remove(OPEN_CLASS);
	},
	open() {
		this.menuContainer.classList.add(OPEN_CLASS);
		this.burgerButton.classList.add(OPEN_CLASS);
		this.onOpen.delayedCall();
		gsap.fromTo(
			this.menuItems,
			{ x: -200, alpha: 0, duration: 0.75 },
			{ x: 0, alpha: 1, delay: 0.35, stagger: 0.15 }
		);
		this.isOpen = true;

		if (!env.isIOS) {
			disableBodyScroll(document.body);
		}
		if (env.isIOS) {
			document.body.style.overflow = 'hidden';
		}
	},
	close() {
		this.menuContainer.classList.remove(OPEN_CLASS);
		this.burgerButton.classList.remove(OPEN_CLASS);
		this.onClose.delayedCall();
		this.isOpen = false;

		if (!env.isIOS) {
			enableBodyScroll(document.body);
		}
		if (env.isIOS) {
			document.body.style.overflow = '';
		}
	},
	toggle() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	},
	_outsideClickListener(event) {
		const { menuContainer } = this;
		if (
			!menuContainer.contains(event.target) &&
			event.target.closest('[data-menu]') === null
		) {
			this.close();
		}
	},
	handleClickOutside() {
		document.addEventListener('click', this._outsideClickListenerShim);
	},
	removeHandleClickOutside() {
		document.removeEventListener('click', this._outsideClickListenerShim);
	},
};

export default new Menu();
