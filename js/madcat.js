// Pure and simple!

let catClosed, catOpen;
let counter, maxCount = 10;
let thresh = 200;
let changeImg = true;
let run = true;

sketch.madcat.init = function () {
    rWidth = width / bins;
    if (!catClosed) catClosed = loadImage('assets/cat-closed.png');
    if (!catOpen) catOpen = loadImage('assets/cat-open.png');
};

sketch.madcat.draw = function () {
    colorMode(HSB);
    noStroke();
    let img = catClosed;
    let op = 50;

    counter = (counter + 1) % maxCount;
    if (getEnergy("bass") >= thresh) {
        background(color(Math.random() * 360, 255, 100));
        img = catOpen;
        op = 0;
    }

    let x = (width - img.width) / 2;
    let y = (height - img.height) / 2;

    image(img, x, y);
};