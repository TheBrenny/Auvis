// Pure and simple!

sketch.logd.init = function () {};

sketch.logd.draw = function () {
    colorMode(HSB);

    for (var i = 0; i < bins; i++) {
        var c = map(log(i), 0, log(bins), 0, 180);
        stroke(c, 255, 100);
        fill(c, 255, 100);
        var x = map(log(i), 0, log(bins), 0, width);
        var h = map(getEnergy(map(i, 0, bins, minFreq, maxFreq)), 0, 255, 0, height);
        var rectangle_width = (log(i + 1) - log(i)) * (width / log(bins));
        rect(x, height, rectangle_width, -h);
    }
};