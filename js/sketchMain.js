var bins = 1024;
var binWidth;
var screenSizeMultiplier;
var alphaValMax = 750;
var alphaVal = alphaValMax;
var alphaFadeVal = 7;
var soundFiles = [null];

var canvas;
var soundIn;
var soundState = -1;
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
	"super": [5000, 1000]
};
freqRanges.allbass = [freqRanges.subbass[0], freqRanges.bass[1]];
freqRanges.allmid = [freqRanges.lowmid[0], freqRanges.highmid[1]];
freqRanges.allhigh = [freqRanges.high[0], freqRanges.super[1]];

var fileLoading = {
	current: null,
	alphaValMax: 750,
	alphaVal: 0,
	alphaFadeVal: 7
	// obj: {
	//	status: 0,
	//	sound: null
	//}
};
var soundCache = {};

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
	embedScript("./userScript.js");
	loadSketchRegister();
	var winMin = min(windowWidth, windowHeight);
	canvas = createCanvas(winMin, winMin);
	canvas.style("align-self", "center");
	canvas.style("margin", "auto");

	soundFormats('mp3', 'wav');
	fft = new p5.FFT();
	setFftFreqRanges();
	setSoundAsInput();
	soundState = 0;

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
	if (!!soundIn) soundIn.stop();
	fileLoading.current = null;
	soundIn = new p5.AudioIn();
	fft.setInput(soundIn);
	soundIn.start();
}

function setSoundAsFile(soundPath) {
	if (!!soundIn) soundIn.stop();

	let fn = soundPath;
	fileLoading.alphaVal = fileLoading.alphaValMax;
	fileLoading.current = fn;

	if (!!fileLoading[fn]) {
		if (fileLoading[fn].status == 1) fileLoading[fn].sound.jump(); // reset play head on the object and begin playback
	} else {
		fileLoading[fn] = {};
		fileLoading[fn].status = 0;
		fileLoading[fn].fileName = soundPath;
		fileLoading[fn].name = soundPath.substring(soundPath.lastIndexOf('/') + 1, soundPath.lastIndexOf("."));

		fileLoading[fn].sound = loadSound(soundPath, () => {
			fileLoading[fn].status = 1;
			if (fileLoading.current == fn) fileLoading[fn].sound.play();
		}, () => console.log("error loading file: " + soundPath), (v) => {
			fileLoading[fn].status = v;
		});
	}
	soundIn = fileLoading[fn].sound;

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

	let file = fileLoading[fileLoading.current];
	if (file.status > 0 && fileLoading.alphaVal >= 0) {
		push();
		colorMode(RGB);
		fill(200, 30, 255, fileLoading.alphaVal);
		noStroke();
		textSize(30);
		textAlign(CENTER, BOTTOM);
		rect(0, height - 20, map(file.status, 0, 1, 0, width), 20);

		if (!!file.name) text(file.name, width / 2, height - 25);

		if (file.status == 1) fileLoading.alphaVal -= fileLoading.alphaFadeVal;
	}
}

function draw() {
	colorMode(RGB);
	background(16, 16, 16);

	spectrum = fft.analyze();
	if (sketch.selected && sketch[sketch.selected].draw) sketch[sketch.selected].draw();

	drawTitle();
	drawFileLoader();
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

function touchStarted() {
	mouseMoved();

	var c = Object.keys(sketch).remove("selected");
	var i = (c.indexOf(sketch.selected) + 1) % c.length;
	sketch.selected = c[i];
	sketchChanged();
}

function mouseMoved() {
	alphaVal = alphaValMax;
}

function keyPressed() {
	switch (keyCode) {
		case 32: // space bar
			soundState = ++soundState % soundFiles.length;
			if (soundState == 0) setSoundAsInput();
			else if (soundState > 0) setSoundAsFile("sound/" + soundFiles[soundState]);
			break;
		case LEFT_ARROW: // left arrow
			if (soundState != 0) soundIn.jump(soundIn.currentTime() - 10);
			break;
		case RIGHT_ARROW: // right arrow
			if (soundState != 0) soundIn.jump(soundIn.currentTime() + 10);
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
	bins = 1024;
	fft.setBins(bins);
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