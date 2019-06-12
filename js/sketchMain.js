var bins = 1024;
var binWidth;
var screenSizeMultiplier;
var alphaValMax = 750;
var alphaVal = alphaValMax;
var alphaFadeVal = 7;
let minFreq = 20;
let maxFreq = 14000;

var canvas;
var soundIn;
var fft;
var amp;
var getEnergy = () => {};
var getVolume = () => {};

var sketch = {};

Object.defineProperty(Object.prototype, "objSize", {
    enumerable: false,
    value: function () {
        return Object.keys(this).length;
    }
});

Object.defineProperty(Array.prototype, "remove", {
    enumerable: false,
    value: function () {
        var l, a = arguments;
        for (var i = 0; i < a.length; i++) {
            l = this.indexOf(a[i]);
            if (l >= 0) this.splice(l, 1);
        }
        return this;
    }
});

p5.FFT.prototype.setBins = function (bins) {
    this.bins = bins;
    this.analyser.fftSize = bins * 2;
};

function setup() {
    loadSketchRegister();
    var winMin = min(windowWidth, windowHeight);
    canvas = createCanvas(winMin, winMin);
    canvas.style("align-self", "center");
    canvas.style("margin", "auto");

    soundIn = new p5.AudioIn();
    soundIn.start();
    fft = new p5.FFT();
    fft.setInput(soundIn);
    getEnergy = fft.getEnergy.bind(fft);
    getVolume = soundIn.getLevel.bind(soundIn);

    binWidth = windowWidth / bins;
    windowResized();
    touchStarted();
}

function drawTitle() {
    if (alphaVal >= 0) {
        push();
        colorMode(RGB);
        textSize(60);
        textAlign(CENTER, CENTER);
        fill(200, 30, 255, constrain(alphaVal, 0, 255));
        noStroke();
        sketch.selected && text(sketch.selected.toUpperCase(), width / 2, 45);
        alphaVal -= alphaFadeVal;
        pop();
    }
}

function draw() {
    colorMode(RGB);
    background(16, 16, 16);

    fft.analyze();
    if (sketch.selected && sketch[sketch.selected].draw) {
        push();
        sketch[sketch.selected].draw();
        pop();
    }

    drawTitle();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    screenSizeMultiplier = width / 800;
}

function touchStarted() {
    mouseMoved();
    getAudioContext().resume();

    var c = Object.keys(sketch).remove("selected");
    var i = (c.indexOf(sketch.selected) + 1) % c.length;
    sketch.selected = c[i];
    sketchChanged();
}

function mouseMoved() {
    alphaVal = alphaValMax;
}

function registerSketch(sketchName, fileName) {
    fileName = !!fileName ? fileName : sketchName;
    sketch[sketchName] = {
        "fileName": fileName
    };
}

function sketchChanged() {
    resetSketch();
    if (sketch.selected && sketch[sketch.selected] && sketch[sketch.selected].init) sketch[sketch.selected].init();
}

function resetSketch() {
    fft.smooth(0.8);
    bins = 1024;
    fft.setBins(bins);
    alphaVal = alphaValMax;
}

function loadSketchRegister() {
    var body = document.body;
    var script;
    for (var s in sketch) {
        script = document.createElement("script");
        script.src = "./js/" + sketch[s].fileName + ".js";
        body.appendChild(script);
    }
}

registerSketch("simple");
registerSketch("logd");
registerSketch("centroid");
registerSketch("energy");
registerSketch("exagerate");
registerSketch("background");
registerSketch("kuana");
registerSketch("madcat");