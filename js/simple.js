// Pure and simple!

let rWidth = 0;

sketch.simple.init = function () {
    rWidth = width / bins;
};

sketch.simple.draw = function () {
    colorMode(HSB);
    noStroke();

    let c, x, h;
    for (var i = 0; i < bins; i++) {
        c = map(i, 0, bins, 0, 300);
        fill(c, 255, 100);
        x = i * rWidth;
        h = map(getEnergy(map(i, 0, bins, minFreq, maxFreq)), 0, 255, 0, height);

        rect(x, height, rWidth, -h);
    }
};