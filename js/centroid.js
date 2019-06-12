// Uses the getCentroid() function to find the centre of our visualiser.

var centroid;
let logBins = log(bins);

sketch.centroid.init = function() {
    logBins = log(bins);
};

sketch.centroid.draw = function() {
    centroid = fft.getCentroid();
    colorMode(HSB);

    var spectrumWidth = width * 2;
    for (var i = 0; i < bins; i++) {
        var c = map(log(i), 0, logBins, 0, 180);
        stroke(c, 255, 100);
        fill(c, 255, 100);
        var x = map(log(i), 0, logBins, 0, spectrumWidth);
        var h = map(getEnergy(i), 0, 255, 0, height);
        var rectangle_width = (log(i + 1) - log(i)) * ((spectrumWidth) / logBins);
        rect(x - centroidOffset(centroid, bins, spectrumWidth), height, rectangle_width, -h);
    }
};

function centroidOffset(centroid, spectrumLength, spectrumWidth) {
    var nyquist = 22050;
    var mean_freq_index = centroid / (nyquist / spectrumLength);
    return map(log(mean_freq_index), 0, log(spectrumLength), 0, spectrumWidth) / 2;
}