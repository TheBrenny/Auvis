// Uses the getEnergy() function to create circles that bobble!

var previousEnergiesMax = 10;
var energyChangeThreshold = 75;
//var exagerationMultiplier = 3;
var exagerationMultiplier = 3;
var smoothingFactor = 0.9;
var previousEnergies = [];

sketch.exagerate.init = function() {
    fft.smooth(0);
};

function smoothFFT(destEnergy, oldEnergy, newEnergy) {
    for (var e in oldEnergy) {
        if (oldEnergy.hasOwnProperty(e) && newEnergy.hasOwnProperty(e)) {
            destEnergy[e] = smoothingFactor * oldEnergy[e] + (1 - smoothingFactor) * newEnergy[e];
        }
    }
}

function exagerateEnergies(incoming) {
    var f, fAve, exagerated;
    var h;
    var en = {};

    if (previousEnergies.length === 0) previousEnergies.unshift(incoming);
    previousEnergies.unshift(incoming);
    previousEnergies.length = min(previousEnergiesMax, previousEnergies.length);

    for (var e in incoming) {
        h = [];
        exagerated = false;
        f = incoming[e];

        fAve = 0;
        for (var i = 0; i < previousEnergies.length; i++) {
            fAve += previousEnergies[i][e];
            h.unshift(previousEnergies[i][e]);
        }
        fAve /= previousEnergies.length;

        if (incoming[e] - fAve > energyChangeThreshold) {
            //f += (incoming[e] - fAve) * exagerationMultiplier;
            f *= exagerationMultiplier;
            exagerated = true;
        }

        en[e] = f;
    }

    smoothFFT(previousEnergies[0], previousEnergies[1], en);
    return previousEnergies[0];
}

sketch.exagerate.draw = function() {
    var energies = exagerateEnergies({
        bass: getEnergy("bass"),
        lowMid: getEnergy("lowMid"),
        mid: getEnergy("mid"),
        highMid: getEnergy("highMid"),
        treble: getEnergy("treble")
    });
    colorMode(HSB);
    var i = 0;
    for (var e in energies) {
        var c = map(i, 0, energies.objSize(), 0, 270);
        var l = constrain(map(energies[e], 0, 230, 20, 100), 0, 100);
        stroke(c, 255, l);
        fill(c, 255, l);

        multiplier = map(energies[e], 0, 255, 0.75, 1.75);

        var x = width / 2;
        var y = height / 2;
        var size = ((energies.objSize() - i) * 50) * multiplier * screenSizeMultiplier;

        ellipse(x, y, size);

        i++;
    }
};