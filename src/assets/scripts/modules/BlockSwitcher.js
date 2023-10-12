class BlockSwitcher {
	constructor() {
		this.buttons = document.querySelectorAll('button[data-target]');
		this.blocks = document.querySelectorAll('div[data-block]');

		this.buttons.forEach((button) => {
			button.addEventListener('click', () => this.switchBlocks(button));
		});
	}

	switchBlocks(clickedButton) {
		const targetBlockId = clickedButton.getAttribute('data-target');

		this.buttons.forEach((button) => {
			const isActive = button === clickedButton;
			button.classList.toggle('_active', isActive);
		});

		this.blocks.forEach((block) => {
			const isActive = block.getAttribute('data-block') === targetBlockId;
			block.classList.toggle('_active', isActive);
		});
	}
}

export default new BlockSwitcher();
