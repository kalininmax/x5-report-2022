const Image = require('@11ty/eleventy-img');
const PATHS = require('../../paths');

module.exports = (
	src,
	cls,
	attr,
	widths = [640, 960, 1280, 1920, 2560],
	sizes = '100vw',
	format = 'webp',
	alt = '',
	loading = 'lazy',
	decoding = 'async'
) => {
	const subfolder = src.match(/^.*\//);
	const subfolderPath = subfolder ? subfolder[0] : '';
	const imgPath = PATHS.src.images + src;

	const options = {
		widths: widths,
		formats: format,
		urlPath: '/assets/images/' + subfolderPath,
		outputDir: PATHS.build.images + subfolderPath,
		sharpWebpOptions: { quality: 90 },
	};

	Image(imgPath, options);

	const metadata = Image.statsSync(imgPath, options);

	const lowsrc = metadata[format][0];
	const highsrc = metadata[format][metadata[format].length - 1];

	const imgClassName = cls ? ` class="${cls}"` : '';
	const imgAttr = attr ? ` ${attr}` : '';

	const srcSet = Object.values(metadata)
		.map((img) => `${img.map((entry) => entry.srcset).join(', ')}`)
		.join();

	return `<img${imgClassName} src="${lowsrc.url}" srcset="${srcSet}" sizes="${sizes}" width="${highsrc.width}" height="${highsrc.height}" alt="${alt}" loading="${loading}" decoding="${decoding}"${imgAttr}>`;
};
