class Header {
	constructor() {
		const langButton = document.querySelector('[data-lang-button]');
		const urlBase = window.location.href.substring(
			0,
			window.location.href.lastIndexOf('/') + 1
		);
		const page = window.location.href.substr(
			window.location.href.lastIndexOf('/') + 1
		);
		let pathname = window.location.pathname;
		let btnText;
		if (pathname.search('/ru') >= 0) {
			pathname = pathname.replace('/ru', '');
			btnText = 'EN';
		} else {
			pathname = urlBase + 'ru/' + page;
			btnText = 'RU';
		}
		langButton.href = pathname;
		langButton.textContent = btnText;
	}
}

export default new Header();
