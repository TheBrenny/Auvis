var bins = 1024;
var binWidth;
var screenSizeMultiplier;
var alphaValMax = 750;
var alphaVal = alphaValMax;
var alphaFadeVal = 7;

var canvas;
var soundIn;
var fft;
var amp;
var spectrum;

var sketch = {};

var scWidget = {
    x: 0,
    y: 0,
    width: 500,
    height: 125,
    player: null
};

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
    loadSketchRegister();
    var winMin = min(windowWidth, windowHeight);
    canvas = createCanvas(winMin, winMin);
    canvas.style("align-self", "center");
    canvas.style("margin", "auto");

    scWidget.x = (windowWidth - scWidget.width) / 2;
    scWidget.y = windowHeight - scWidget.height * 1.5;

    soundIn = new p5.AudioIn();
    soundIn.start();
    fft = new p5.FFT();
    fft.setInput(soundIn);
    scWidget.player = new SoundcloudPlayer(fft, p5);

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

function drawScWidget() {
    if (alphaVal >= 0) {
        push();
        var a = constrain(alphaVal, 0, 255);
        var x = scWidget.x;
        var y = scWidget.y;
        var w = scWidget.width;
        var h = scWidget.height;
        var t = scWidget.player.getTime();
        var tm = scWidget.player.getTimeMax();
        colorMode(RGB);

        // Background
        fill(153, 153, 153, map(constrain(alphaVal, 0, 255), 0, 255, 0, 153));
        noStroke();
        rect(x, y, w, h);

        // Image
        fill(200, 30, 255, a);
        rect(x + 10, y + 15, 65, 65);

        // Title
        textSize(30);
        textAlign(LEFT, TOP);
        fill(0, 0, 0, a);
        text(scWidget.player.getTitle(), x + 85, y + 20);

        // Artist
        textSize(15);
        textAlign(LEFT, TOP);
        fill(40, 40, 40, a);
        text(scWidget.player.getArtist(), x + 85, y + 55);

        // Control Buttons
        fill(255, 85, 0, a);
        ellipse(x + w - 40, y + 40, 30); // Next
        ellipse(x + w - 80, y + 40, 30); // Play/Pause
        ellipse(x + w - 120, y + 40, 30); // Previous

        stroke(0, 0, 0, a);
        fill(0, 0, 0, a);
        beginShape();
        vertex(x + w - 37.5, y + 40);
        vertex(x + w - 47.5, y + 30);
        vertex(x + w - 47.5, y + 50);
        vertex(x + w - 37.5, y + 41);
        vertex(x + w - 37.5, y + 50);
        vertex(x + w - 32.5, y + 50);
        vertex(x + w - 32.5, y + 30);
        vertex(x + w - 37.5, y + 30);
        endShape(CLOSE);
        beginShape();
        if (scWidget.player.isPlaying()) {
            vertex(x + w - 82.5, y + 30);
            vertex(x + w - 87.5, y + 30);
            vertex(x + w - 87.5, y + 50);
            vertex(x + w - 82.5, y + 50);
            endShape(close);
            noStroke();
            beginShape();
            vertex(x + w - 72.5, y + 30);
            vertex(x + w - 77.5, y + 30);
            vertex(x + w - 77.5, y + 50);
            vertex(x + w - 72.5, y + 50);
        } else {
            vertex(x + w - 70, y + 40);
            vertex(x + w - 85, y + 30);
            vertex(x + w - 85, y + 50);
        }
        endShape(CLOSE);
        beginShape();
        vertex(x + w - 122.5, y + 40);
        vertex(x + w - 112.5, y + 30);
        vertex(x + w - 112.5, y + 50);
        vertex(x + w - 122.5, y + 41);
        vertex(x + w - 122.5, y + 50);
        vertex(x + w - 127.5, y + 50);
        vertex(x + w - 127.5, y + 30);
        vertex(x + w - 122.5, y + 30);
        endShape(CLOSE);
        noStroke();

        // Track Indicator
        textSize(10);
        textAlign(CENTER, TOP);
        fill(40, 40, 40, a);
        text(scWidget.player.getPlaylistTrackIndex() + " / " + scWidget.player.getPlaylistSize(), x + w - 80, y + 60);

        // Scrubber
        fill(179, 59, 0, a);
        rect(x + 10, y + h - 30, map(t, 0, tm, 0, w - 20), 10);
        fill(74, 71, 69, a);
        rect(x + 10 + map(t, 0, tm, 0, w - 20), y + h - 30, map(tm - t, 0, tm, 0, w - 20), 10);
        rectMode(CENTER);
        fill(255, 85, 0, a);
        rect(x + 10 + map(t, 0, tm, 0, w - 20), y + h - 25, 15, 15);
        textSize(10);
        textAlign(CENTER, TOP);
        fill(40, 40, 40, a);
        text((floor(t / 60)) + ":" + round(t % 60), x + 10 + map(t, 0, tm, 0, w - 20), y + h - 15);
        pop();
    }
}

function draw() {
    colorMode(RGB);
    background(16, 16, 16);

    spectrum = fft.analyze();
    if (sketch.selected && sketch[sketch.selected].draw) sketch[sketch.selected].draw();

    if (touchedWidget(false)) alphaVal = alphaValMax;
    drawTitle();
    drawScWidget();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    screenSizeMultiplier = width / 800;
}

function touchStarted() {
    mouseMoved();

    if (!touchedWidget(true)) {
        var c = Object.keys(sketch).remove("selected");
        var i = (c.indexOf(sketch.selected) + 1) % c.length;
        sketch.selected = c[i];
        sketchChanged();
    }
}

function mouseMoved() {
    alphaVal = alphaValMax;
}

function registerSketch(sketchName, fileName) {
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

registerSketch("simple", "simple");
registerSketch("centroid", "centroid");
registerSketch("energy", "energy");
registerSketch("exagerate", "exagerate");
registerSketch("background", "background");