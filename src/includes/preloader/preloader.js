import Signal from '../../assets/scripts/classes/Signal';
import Menu from '../../components/menu/menu';

const ACTIVE_CLASS = '_active';
const TRANSITION_TIME = 400;

function Preloader() {
	this.isOpen = true;
	this.container = document.getElementById('preloader');
	this.onShown = new Signal();
	this.onHide = new Signal();

	this.onShown.add(Menu.close.bind(Menu));
}

Preloader.prototype = {
	show() {
		this.container.classList.add(ACTIVE_CLASS);
		setTimeout(() => this.onShown.call(), TRANSITION_TIME);
		this.isOpen = true;
	},
	hide() {
		this.container.classList.remove(ACTIVE_CLASS);
		setTimeout(() => this.onHide.call(), TRANSITION_TIME);
		this.isOpen = false;
	},
};

export default new Preloader();
