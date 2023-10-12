class StopCopy {
	constructor() {
		this.preventCopy();
		this.preventPageSearch();
		this.preventTextSelection();
	}

	preventCopy() {
		document.addEventListener('keydown', (event) => {
			if (
				(event.ctrlKey || event.metaKey) &&
				(event.key.toLowerCase() === 'a' || event.key.toLowerCase() === 'c')
			) {
				event.preventDefault();
			}
		});

		document.addEventListener('contextmenu', (event) => {
			event.preventDefault();
		});
	}

	preventPageSearch() {
		document.addEventListener('keydown', (event) => {
			if (
				(event.ctrlKey || event.metaKey) &&
				(event.key.toLowerCase() === 'f' || event.key.toLowerCase() === 'g')
			) {
				event.preventDefault();
			}
		});
	}

	preventTextSelection() {
		document.addEventListener('mousedown', (event) => {
			event.preventDefault();
		});

		document.addEventListener('selectstart', (event) => {
			event.preventDefault();
		});
	}
}

export default new StopCopy();
