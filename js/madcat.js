// Pure and simple!

let catClosed, catOpen;
let counter = 0, maxCounter = 3;
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
	if(counter == 0) madcatColor = color(Math.random() * 360, 255, 100);
    if (fft.getEnergy("bass") >= thresh) {
        background(madcatColor);
        img = catOpen;
    }

    let x = (width - img.width) / 2;
    let y = (height - img.height) / 2;

    image(img, x, y);
};