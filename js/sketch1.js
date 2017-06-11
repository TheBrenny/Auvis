// Pure and simple!

registerSketch("simple");

sketch.simple.init = function() {};

sketch.simple.draw = function() {
    colorMode(HSB);

    for (var i = 0; i < spectrum.length; i++) {
        var c = map(log(i), 0, log(spectrum.length), 0, 180);
        stroke(c, 255, 100);
        fill(c, 255, 100);
        var x = map(log(i), 0, log(spectrum.length), 0, width);
        var h = map(spectrum[i], 0, 255, 0, height);
        var rectangle_width = (log(i + 1) - log(i)) * (width / log(spectrum.length));
        rect(x, height, rectangle_width, -h)
    }
};