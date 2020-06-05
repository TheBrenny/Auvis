//Flashes background color based on the highest energy.

var energyColors = {
    bass: null,
    lowMid: null,
    mid: null,
    highMid: null,
    treble: null
};
var pastEnergy;

sketch.background.init = function() {
    colorMode(HSB);
    let i = 0;
    //let offset = random(0, 360);
    for (let c in energyColors) {
        if (energyColors.hasOwnProperty(c))
            energyColors[c] = color((map(i, 0, energyColors.objSize(), 0, 180)) % 360, 255, 100);
        i++;
    }
};

sketch.background.draw = function() {
    colorMode(HSB);

    var energies = exagerateEnergies({
        bass: getEnergy("allbass"),
        lowMid: getEnergy("lowmid"),
        mid: getEnergy("mid"),
        highMid: getEnergy("highmid"),
        treble: getEnergy("allhigh")
    });

    if (pastEnergy) {
        var best = "bass";
        var bestForce = 0;
        for (var e in energies) {
            if (energies[e] - pastEnergy[e] > bestForce) {
                bestForce = energies[e];
                best = e;
            }
        }
        background(energyColors[best]);
    }
    drawTitle();
    pastEnergy = energies;
};