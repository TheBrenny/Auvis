// Pure and simple!

let radius = min(width, height) / 3;
let maxLength = radius;
let points = 100;
let binCount = 1024;
let binSkip = binCount / points;

sketch.kuana.init = function () {
    kuanaCounter = 0;
    radius = min(width, height) / 3;
    binSkip = binCount / points;
    fft.setBins(binCount);
    fft.smooth(0.675);
};

sketch.kuana.draw = function () {
    // draw background
    colorMode(HSB);

    // draw forground
    colorMode(RGB);
    stroke(240, 240, 240);

    let kx = width / 2,
        ky = height / 2,
        ko;
    let lx1, ly1, lx2, ly2;
    let ang;
    let vol1, vol2;

    for (let i = 0; i < points; i++) {
        // the line
        ang = i * 360 / points;
        ang -= 90;
        ko = getOffset(ang, radius);

        vol1 = getOffset(ang, map(getEnergy(map(i, 0, points, minFreq, maxFreq)), 0, 255, 0, maxLength));

        lx1 = kx + ko[0] - (vol1[0] / 2);
        ly1 = ky + ko[1] - (vol1[1] / 2);


        // connectors
        ang = (i + 1) * 360 / points;
        ang -= 90;
        ko = getOffset(ang, radius);

        vol2 = getOffset(ang, map(getEnergy(map((i + 1) % points, 0, points, minFreq, maxFreq)), 0, 255, 0, maxLength));

        lx2 = kx + ko[0] - (vol2[0] / 2);
        ly2 = ky + ko[1] - (vol2[1] / 2);

        // circle draw
        stroke(60, 60, 60);
        line(lx1 + vol1[0] / 2, ly1 + vol1[1] / 2, lx2 + vol2[0] / 2, ly2 + vol2[1] / 2);
        stroke(240, 240, 240);

        // line
        line(lx1, ly1, lx1 + vol1[0], ly1 + vol1[1]);

        //connectors
        line(lx1, ly1, lx2, ly2);
        line(lx1 + vol1[0], ly1 + vol1[1], lx2 + vol2[0], ly2 + vol2[1]);

    }
};

function getOffset(ang, dist) {
    let xO = Math.sin(radians(ang)) * dist;
    let yO = Math.cos(radians(ang)) * dist;

    return [-xO, yO];
}