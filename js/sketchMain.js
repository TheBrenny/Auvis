var bins = 1024;
var defaultBins = 2048;
var binWidth;
var screenSizeMultiplier;
var alphaValMax = 750;
var alphaVal = alphaValMax;
var alphaFadeVal = 7;
var soundFiles = [null];

var contextReady = false;
var canvas;
var soundIn;
var soundState = 0;
var fft;
var amp;
var spectrum;

var freqRanges = {
	"subbass": [20, 60],
	"bass": [60, 180],
	"lowmid": [180, 350],
	"mid": [350, 700],
	"highmid": [700, 1200],
	"high": [1200, 5000],
	"super": [5000, 10000]
};
freqRanges.allbass = [freqRanges.subbass[0], freqRanges.bass[1]];
freqRanges.allmid = [freqRanges.lowmid[0], freqRanges.highmid[1]];
freqRanges.allhigh = [freqRanges.high[0], freqRanges.super[1]];
binWidth = (freqRanges.allhigh[1] - freqRanges.allbass[0]) / bins;

var fileLoading = {
	current: null,
	alphaVal: 0,
	// obj: {
	//	status: 0,
	//	sound: null
	//}
};
var soundCache = {};

var sketch = {};
var debugging = false;

var circleFn = function (x) {
	return sqrt(1 - x * x);
};

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
	embedScript("./userScript.js");
	loadSketchRegister();
	var winMin = min(windowWidth, windowHeight);
	canvas = createCanvas(winMin, winMin);
	canvas.style("align-self", "center");
	canvas.style("margin", "auto");

	soundFormats('mp3', 'wav');
	fft = new p5.FFT();
	setSoundAsInput();
	setFftFreqRanges();

	binWidth = windowWidth / bins;
	windowResized();
	touchStarted();
}

function setFftFreqRanges() {
	fft.bass = [1, 120];
	fft.lowMid = [120, 350];
	fft.mid = [350, 1250];
	fft.highMid = [1250, 4000];
	fft.treble = [4000, 13000];
}

function setSoundAsInput() {
	fileLoading.current = null;
	soundIn = new p5.AudioIn();
	fft.setInput(soundIn);
	soundIn.start();
}

// Uses the createAudio() method instead of loadSound() above.
function setSoundAsFile(soundPath) {
	let fn = soundPath;
	fileLoading.alphaVal = alphaValMax;
	fileLoading.current = fn;

	if (!!fileLoading[fn]) {
		if (fileLoading[fn].status == 1) {
			fileLoading[fn].sound.elt.currentTime = 0;
		}
	} else {
		fileLoading[fn] = {};
		fileLoading[fn].filename = fn;
		fileLoading[fn].name = fn.substring(fn.lastIndexOf("/") + 1, fn.lastIndexOf("."));
		let ele = createAudio(fn);
		ele.autoplay(true);
		fileLoading[fn].sound = ele;
		fileLoading[fn].status = fileLoading[fn].sound.elt.buffered; // TimeRanges object
	}

	soundIn = fileLoading[fn].sound;
	soundIn.play();
	fft.setInput(soundIn);
}

function drawTitle() {
	if (alphaVal >= 0) {
		push();
		colorMode(RGB);
		textSize(60);
		textAlign(CENTER, CENTER);
		fill(200, 30, 255, constrain(alphaVal, 0, 255));
		noStroke();
		if (sketch.selected) text(sketch.selected.toUpperCase(), width / 2, 45);
		alphaVal -= alphaFadeVal;
		pop();
	}
}

function drawFileLoader() {
	if (fileLoading.current == null) return;

	if (fileLoading.alphaVal >= 0) {
		// update status
		fileLoading[fileLoading.current].status = fileLoading[fileLoading.current].sound.elt.buffered;
		let file = fileLoading[fileLoading.current];

		push();
		colorMode(RGB);
		fill(200, 30, 255, fileLoading.alphaVal);
		noStroke();
		textSize(30);
		textAlign(CENTER, BOTTOM);

		// Draw status(es)
		for (let i = 0; i < file.status.length; i++) {
			let start = file.status.start(i);
			let end = file.status.end(i);
			let len = end - start;
			let x = map(start, 0, file.sound.duration(), 0, width);
			let w = map(len, 0, file.sound.duration(), 0, width);
			rect(x, height - 20, w, 20);
		}

		if (!!file.name) text(file.name, width / 2, height - 25);
		fileLoading.alphaVal -= alphaFadeVal;
	}
}

function drawRequestContext() {
	push();
	colorMode(RGB);
	textSize(100);
	textAlign(CENTER, CENTER);
	fill(200, 30, 255);
	noStroke();
	text("Touch/Click the screen to start!", width / 2, height / 2);
	textSize(50);
	text("[SPACE] to change Audio Sources", width / 2, height / 2 + 125);
	text("[LEFT ARROW] to rewind 10s", width / 2, height / 2 + 125 + 75);
	text("[RIGHT ARROW] to fastforward 10s", width / 2, height / 2 + 125 + 75 + 75);
	pop();
}

function draw() {
	colorMode(RGB);
	background(16, 16, 16);

	spectrum = fft.analyze();
	push();
	if (sketch.selected && sketch[sketch.selected].draw) sketch[sketch.selected].draw();
	pop();
	if (this.debugging) {
		push();
		if (sketch.selected && sketch[sketch.selected].debug) {
			sketch[sketch.selected].debug();
		} else {
			sketch.simple.debug();
		}
		pop();
	}

	drawTitle();
	drawFileLoader();
	if (!contextReady) drawRequestContext();
}

function getEnergy(freq1, freq2) {
	if (!!freqRanges[freq1]) {
		freq2 = freqRanges[freq1][1];
		freq1 = freqRanges[freq1][0];
	}
	return fft.getEnergy(freq1, freq2);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	screenSizeMultiplier = width / 800;
}

function touchStarted(event) {
	if (!!event && !contextReady) {
		getAudioContext().resume();
		contextReady = true;
	}
	mouseMoved();

	var c = Object.keys(sketch).remove("selected");
	var i = (c.indexOf(sketch.selected) + 1) % c.length;
	sketch.selected = c[i];
	sketchChanged();
}

function mouseMoved() {
	alphaVal = alphaValMax;
	fileLoading.alphaVal = alphaValMax;
}

function keyPressed() {
	switch (keyCode) {
		case 32: // space bar
			soundState = ++soundState % soundFiles.length;
			if (!!soundIn) soundIn.stop();
			if (soundState == 0) setSoundAsInput();
			else if (soundState > 0) setSoundAsFile("sound/" + soundFiles[soundState]);
			break;
		case LEFT_ARROW: // left arrow
			if (soundState != 0) soundIn.elt.currentTime -= 10;
			break;
		case RIGHT_ARROW: // right arrow
			if (soundState != 0) soundIn.elt.currentTime += 10;
			break;
		default:
			if (key == 'd') debugging = !debugging;
			break;
	}
}

function registerSketch(sketchName, fileName) {
	fileName = !!fileName ? fileName : sketchName;
	sketch[sketchName] = {
		"fileName": fileName
	};
}

function registerSoundFile(fileName) {
	soundFiles.push(fileName);
}

function sketchChanged() {
	resetSketch();
	if (sketch.selected && sketch[sketch.selected] && sketch[sketch.selected].init) sketch[sketch.selected].init();
}

function resetSketch() {
	fft.smooth(0.8);
	bins = defaultBins;
	fft.bins = bins;
	alphaVal = alphaValMax;
}

function loadSketchRegister() {
	for (var s in sketch) embedScript("./js/" + sketch[s].fileName + ".js");
}

function embedScript(script) {
	var body = document.body;
	var scriptEl = document.createElement("script");
	scriptEl.src = script;
	body.appendChild(scriptEl);
}

registerSketch("simple");
//registerSketch("logd"); // commented because there's undeclared variables
registerSketch("centroid");
registerSketch("energy");
registerSketch("exagerate");
registerSketch("background");
//registerSketch("kuana"); // commented because there's undeclared variables
registerSketch("madcat");
registerSketch("starfield");