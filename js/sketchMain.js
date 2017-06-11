var bins = 1024;
var binWidth;
var screenSizeMultiplier;
var alphaVal = 750;
var alphaFadeVal = 7;

var canvas;
var soundIn;
var fft;
var amp;
var spectrum;

var sketch = {};

Object.defineProperty(Object.prototype, "objSize", {
    enumerable: false,
    value: function() {
        return Object.keys(this).length;
    }
});

Object.defineProperty(Array.prototype, "remove", {
    enumerable: false,
    value: function() {
        var l, a = arguments;
        for (var i = 0; i < a.length; i++) {
            l = this.indexOf(a[i]);
            if (l >= 0) this.splice(l, 1);
        }
        return this;
    }
});

p5.FFT.prototype.setBins = function(bins) {
    this.bins = bins;
    this.analyser.fftSize = bins * 2;
};

function setup() {
    canvas = createCanvas(windowWidth, windowWidth);
    canvas.style("align-self", "center");
    canvas.style("margin", "auto");

    soundIn = new p5.AudioIn();
    soundIn.start();
    fft = new p5.FFT();
    fft.setInput(soundIn);

    binWidth = windowWidth / bins;
    windowResized();
    touchStarted();
}

function drawTitle() {
    if (alphaVal >= 0) {
        textSize(60);
        textAlign(CENTER, CENTER);
        fill(200, 30, 255, constrain(alphaVal, 0, 255));
        noStroke();
        sketch.selected && text(sketch.selected.toUpperCase(), width / 2, 45);
        alphaVal -= alphaFadeVal;
    }
}

function draw() {
    colorMode(RGB);
    background(16, 16, 16);

    drawTitle();

    spectrum = fft.analyze();
    if (sketch.selected && sketch[sketch.selected].draw()) sketch[sketch.selected].draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    screenSizeMultiplier = width / 800;
}

function touchStarted() {
    var c = Object.keys(sketch).remove("selected");
    var i = (c.indexOf(sketch.selected) + 1) % c.length;
    sketch.selected = c[i];
    sketchChanged();
}

function registerSketch(sketchName) {
    sketch[sketchName] = {};
}

function sketchChanged() {
    resetSketch();
    if (sketch.selected && sketch[sketch.selected] && sketch[sketch.selected].init) sketch[sketch.selected].init();
}

function resetSketch() {
    fft.smooth(0.8);
    bins = 1024;
    fft.setBins(bins);
    alphaVal = 750;
}