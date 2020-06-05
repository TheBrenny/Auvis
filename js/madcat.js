// Pure and simple!

let catClosed, catOpen;
let counter = 0,
	maxCounter = 3;
let thresh = 195;
let changeImg = true;
let run = true;
let madcatColor = 0;

sketch.madcat.init = function () {
	rWidth = width / bins;
	if (!catClosed) catClosed = loadImage('assets/cat-closed.png');
	if (!catOpen) catOpen = loadImage('assets/cat-open.png');
};

sketch.madcat.draw = function () {
	colorMode(HSB);
	noStroke();
	let img = catClosed;

	counter = (++counter) % maxCounter;
	if (counter == 0) madcatColor = color(Math.random() * 360, 255, 100);
	if (getEnergy("allbass") >= thresh) {
		background(madcatColor);
		img = catOpen;
	}

	let x = (width - img.width) / 2;
	let y = (height - img.height) / 2;

	image(img, x, y);
};

sketch.madcat.debug = function () {
	sketch.simple.debug();
	let x = map(log(freqRanges.allbass[1] + 1), 0, log(spectrum.length), 0, width);
	let y = map(thresh, 0, 255, height, 0);
	let c = map(getEnergy("allbass"), 0, 255, 130,0);
	stroke(c, 255, 100, 0.5);
	line(0, y, x, y);
	
	noStroke();
	fill(c, 255, 100, 0.5);
	textSize(20);
	textAlign(LEFT, BOTTOM);
	let p = map(getEnergy("allbass"),0,255,0,100);
	text(round(p)+"%", 10,y-10);
};