# Auvis
> An audio visualiser built on p5 and p5-sound!
> 
> Example: https://thebrenny.github.io/Auvis/

## **** **EPILEPSY WARNING** ****

Auvis is a cool little project to diminish productivity with flashing colours and lights. Open the index, allow the audio recording, and play music! Watch the pretty colours dance! 

Features:
1. A variety of visualisation styles (not just bars and shapes).
2. Visualises the sound from a "line in" or an audio file.
3. Easily extendible!

Don't stress if you can't play sound to Stereo Mix/Line In on your computer, you can always register audio files and press the spacebar to play them! Oooooooweeeee!

Want to contribute your own creation? All you have to do is follow this template:

`userScript.js`
```javascript
registerSketch("template");
registerSoundFile("someSong.mp3");
```

`template.js`
```javascript
sketch.template.init = function() {
    // This is the same as p5's setup function.
}

sketch.template.draw = function() {
    // This is the same as p5's draw function.
    // Don't stress, fft.analyze() has already been called for convenience.
    // So just use the spectrum variable or the fft.getEnergy() function!
}
```

Something's broke? Go ahead and fix it and submit a PR. Can't fix it? Create a new issue and someone will!

###### Want to see something cool? Play [this song](https://soundcloud.com/your_secret/saski-faking-bright), while on the "Exagerate" visualisation!
