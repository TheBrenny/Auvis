class Star {
	constructor(freq) {
		let r = Star.randomPosition(3);
		this.setInitialPosition(r[0], r[1], r[2]);
		this.speed = -Infinity;
		this.freq = freq;
		this.power = Star.twinklePower();
		this.brightness = random(15, 100);
		this.saturation = 0;
	}

	setInitialPosition(sx, sy, sz) {
		if (Array.isArray(sx)) {
			if (sx.length >= 3) sz = sx[2];
			else sz = width;
			sy = sx[1];
			sx = sx[0];
		}
		this.sx = this.x = sx;
		this.sy = this.y = sy;
		this.sz = this.z = sz;
	}

	get brightness() {
		return this._brightness;
	}
	set brightness(b) {
		b = map(b, 0, 100, 0, 100);
		if (b <= 15) {
			this.power = abs(Star.twinklePower());
			b = 15;
		}
		if (b >= 100) {
			this.power = -abs(Star.twinklePower());
			b = 100;
		}
		this._brightness = b;
	}
	get saturation() {
		return this._saturation;
	}
	set saturation(s) {
		// overall sound volume
		// Might change this at some point?
		if (s <= 15) s = 15;
		if (s >= 100) s = 100;
		this._saturation = s;
	}

	saturate() {
		let volume = map(this.volume, 0, 255, 0, 100);
		this.saturation = volume;
	}

	/**
	 * Updates the position of this star.
	 * @param {integer} speed 
	 */
	update(speed) {
		if (this.speed != speed) {
			this.speed = speed;
		}

		this.z -= speed;
		this.volume = getEnergy(this.freq);
		this.saturate();
		//this.twinkle();

		// reset position
		if (this.z <= 0) this.setInitialPosition(Star.randomPosition(2));
	}
	draw() {
		// set Vars
		let screenStarX = map(this.x / this.z, 0, 1, 0, width);
		let screenStarY = map(this.y / this.z, 0, 1, 0, height);
		let screenHomeX = map(this.sx / (this.z + this.speed * 3.33), 0, 1, 0, width);
		let screenHomeY = map(this.sy / (this.z + this.speed * 3.33), 0, 1, 0, height);
		let radius = map(this.z, 0, width, 12, 0);

		// draw
		noStroke();
		let hue = map(this.freq / binWidth, 0, spectrum.length, 0, 360);
		fill(hue, this.saturation / 5 * 3, this.brightness / 2);
		//stroke(hue, 40, 50);
		let angle = atan2(-screenStarY, -screenStarX);
		let circEdge = [(radius / 2) * cos(angle - 90), (radius / 2) * sin(angle - 90)];
		triangle(screenHomeX, screenHomeY, screenStarX + circEdge[0], screenStarY + circEdge[1], screenStarX - circEdge[0], screenStarY - circEdge[1]);
		//line(screenHomeX, screenHomeY, screenStarX, screenStarY);

		fill(hue, this.saturation, this.brightness); // colours will change dependant on what freq this star represents, and its brightness will change dependant on how loud this freq is
		noStroke();
		ellipse(screenStarX, screenStarY, radius, radius);
	}

	/**
	 * Returns a 1x3 array of [x,y,z] coordinates. If count is defined and is < 3, then the resulting array is 1x`count`, still in the coordinate format described, but sliced.
	 */
	static randomPosition(count) {
		return [random(-width, width), random(-height, height), random(width)].slice(0, count === undefined ? 3 : count);
	}

	static twinkle(stars, volume) {
		volume = Star.twinkleMap(volume);
		stars.map(s => s.brightness += (s.power * volume) * random(0.8, 1.2));
	}
	static twinklePower() {
		return 1;
	}
	static twinkleMap(volume) {
		return map(volume, 0, 1, 2, 25);
	}
}

let stars = [];
let MAX_SPEED = 40;
let speed = [0, 0, 0];
let twinkles = [0, 0, 0];
let speedPower = 6;
let speedPowerFn = (power) => pow(power, speedPower);
let twinklePower = 1.5;
let twinklePowerFn = (power) => pow(power, twinklePower);
let powerCurvePoints = [];
let twinkleCurvePoints = [];

sketch.starfield.init = function () {
	stars = [];
	for (let i = 0; i < bins; i += 1) {
		stars.push(new Star(i * binWidth + freqRanges.allbass[0]));
	}
	setSpeedPower(speedPower);
	setTwinklePower(twinklePower);
	sfamp = new p5.Amplitude();
};

sketch.starfield.draw = function () {
	speed = [0, 0, 0];
	twinkles = [0, 0, 0];

	// set speed values
	let b0 = freqRanges.allbass[0];
	let b1 = freqRanges.allbass[1];
	speed[0] = (getEnergy("subbass") * 0.60 + getEnergy("bass") * 0.5) / 255; // raw speed (0-1) - the x value - (makes 1.1 because we want to enhance the bass for the moves)
	speed[1] = speedPowerFn(speed[0]); // speed after the function (0-1) - the y value
	speed[2] = map(speed[1], 0, 1, 1, MAX_SPEED, true); // mapped to the real speed (1-MAX_SPEED) - the reported value

	// set the drawing context
	colorMode(HSB);
	background(0);
	translate(width / 2, height / 2);

	// draw and set twinkle values
	for (let i = 0; i < stars.length; i++) {
		stars[i].update(speed[2]);
		stars[i].draw();

		twinkles[0] += stars[i].volume;
	}
	twinkles[0] = twinkles[0] / stars.length / 255; // the x value
	twinkles[1] = twinklePowerFn(twinkles[0]); // the y value
	twinkles[2] = Star.twinkleMap(twinkles[1]); // the reported value
	Star.twinkle(stars, twinkles[1]);
};

sketch.starfield.debug = function () {
	sketch.simple.debug(height / 5 * 3);
	colorMode(HSB);

	//draw curve	
	noFill();
	stroke(0, 0, 100, 0.3);
	strokeWeight(3);
	drawStarfieldPowerCurve();
	//		draw power point
	let c = map(speed[1], 0, 1, 0, 130);
	noStroke();
	fill(c, 255, 100, 0.5);
	circle(speed[0] * 200 + 10, -speed[1] * 200 + 210, 6);
	//		draw power text
	textSize(20);
	textAlign(LEFT, TOP);
	text(round(speed[2]) + "m/s", 10, 30);

	//draw twinkle curve
	noFill();
	stroke(200, 255, 100, 0.3);
	strokeWeight(3);
	drawStarfieldTwinkleCurve();
	//		draw twinkle point
	noStroke();
	fill(200, 255, 100, 0.5);
	circle(twinkles[0] * 200 + 10, -twinkles[1] * 200 + 210, 6);
	//		draw twinkle text
	textSize(20);
	textAlign(LEFT, TOP);
	text(round(twinkles[2]) + "tw/s", 10, 10);
};

let gradient = function gradient(a, b) {
	return (b.y - a.y) / (b.x - a.x);
};
let drawStarfieldCurve = function (points) {
	let f = 0.3;
	let t = 0.9;

	beginShape();
	vertex(points[0].x, points[0].y);

	var m = 0;
	var dx1 = 0;
	var dy1 = 0;

	var preP = points[0];

	for (var i = 1; i < points.length; i++) {
		var curP = points[i];
		nexP = points[i + 1];
		if (nexP) {
			m = gradient(preP, nexP);
			dx2 = (nexP.x - curP.x) * -f;
			dy2 = dx2 * m * t;
		} else {
			dx2 = 0;
			dy2 = 0;
		}

		bezierVertex(
			preP.x - dx1, preP.y - dy1,
			curP.x + dx2, curP.y + dy2,
			curP.x, curP.y
		);

		dx1 = dx2;
		dy1 = dy2;
		preP = curP;
	}
	endShape();
};
let drawStarfieldPowerCurve = function () {
	drawStarfieldCurve(powerCurvePoints);
};
let drawStarfieldTwinkleCurve = function () {
	drawStarfieldCurve(twinkleCurvePoints);
};

let setSpeedPower = function (sp) {
	speedPower = sp;
	powerCurvePoints = [];
	for (let i = 0; i <= 1; i += 0.1) {
		powerCurvePoints.push({
			x: i * 200 + 10,
			y: -speedPowerFn(i) * 200 + 210
		});
	}
};
let setTwinklePower = function (tp) {
	twinklePower = tp;
	twinkleCurvePoints = [];
	for (let i = 0; i <= 1; i += 0.1) {
		twinkleCurvePoints.push({
			x: i * 200 + 10,
			y: -twinklePowerFn(i) * 200 + 210
		});
	}
};