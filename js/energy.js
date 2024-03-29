// Uses the getEnergy() function to create circles that bobble!

var energies;

sketch.energy.init = function() {};

sketch.energy.draw = function() {
    energies = {
        bass: getEnergy("allbass"),
        lowMid: getEnergy("lowmid"),
        mid: getEnergy("mid"),
        highMid: getEnergy("highmid"),
        treble: getEnergy("allhigh")
    };
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