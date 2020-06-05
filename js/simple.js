// Pure and simple!

sketch.simple.init = function () {};

sketch.simple.draw = function () {
	colorMode(HSB);

	for (let i = 0; i < spectrum.length; i++) {
		let c = map(log(i), 0, log(spectrum.length), 0, 180);
		stroke(c, 255, 100);
		fill(c, 255, 100);
		let x = map(log(i), 0, log(spectrum.length), 0, width);
		let h = map(spectrum[i], 0, 255, 0, height);
		let rectangle_width = (log(i + 1) - log(i)) * (width / log(spectrum.length));
		rect(x, height, rectangle_width, -h);
	}
};

sketch.simple.debug = function (barHeight) {
	if (sketch.selected === 'simple') return;
	colorMode(HSB);

	if (!!!barHeight) barHeight = height;

	for (let i = 0; i < spectrum.length; i++) {
		let c = map(log(i), 0, log(spectrum.length), 0, 180);
		stroke(c, 255, 100, 0.5);
		fill(c, 255, 100, 0.2);
		let x = map(log(i), 0, log(spectrum.length), 0, width);
		let h = map(spectrum[i], 0, 255, 0, barHeight);
		let rectangle_width = (log(i + 1) - log(i)) * (width / log(spectrum.length));
		rect(x, height, rectangle_width, -h);
	}
};