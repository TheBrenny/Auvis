SC.initialize({
    client_id: SOUNDCLOUD_CONFIG.id
});

function SoundcloudPlayer(fft, p5) {
    var self = this;
    this.scPlayer = null;
    this.playlist = {
        owner: SOUNDCLOUD_CONFIG.owner,
        name: SOUNDCLOUD_CONFIG.playlist,
        index: -1,
        size: 1,
        jsonData: {}
    };
    this.currentTrack = {
        trackObj: null, // using loadSound - the p5 function
        stream: "url",
        playing: false,
        title: "title",
        artist: "artist",
        trackArt: "url",
        time: 0,
        timeMax: 1
    };

    this.play = function() {
        print("play");
        var cb = function() {
            if (!!this.currentTrack.trackObj) {
                this.currentTrack.trackObj.play();
            }
        }.bind(this);
        if (!this.currentTrack.trackObj) {
            this.currentTrack.trackObj = loadSound(this.currentTrack.stream + "?client_id=" + SC.client_id, function() {
                fft.setInput(this.currentTrack.trackObj);
                cb();
            });
        } else cb();
    };
    this.pause = function() {
        print("pause");
        this.currentTrack.playing = false;
        if (!!this.currentTrack.trackObj) {
            this.currentTrack.trackObj.pause();
        }
    };
    this.seek = function(time) {
        print("seek");
        this.currentTrack.time = time;
        if (!!this.currentTrack.trackObj) {
            this.currentTrack.trackObj.jump(time);
        }
    };
    this.stop = function() {
        print("stop");
        this.currentTrack.playing = false;
        if (!!this.currentTrack.trackObj) {
            this.currentTrack.trackObj.stop();
            this.currentTrack.time = 0;
        }
    };

    this.next = function(skip) {
        this.stop();
        this.playlist.index++;
        if (!!skip && skip >= 0) next(skip--);
        else {
            this.playlist.index %= this.playlist.size;
            var track = this.playlist.jsonData.tracks[this.playlist.index];
            this.currentTrack.stream = track.stream_url;
            this.currentTrack.title = track.title;
            this.currentTrack.artist = track.user.username;
            this.currentTrack.timeMax = track.duration / 1000;
        }
    };
    this.previous = function(skip) {
        this.stop();
        this.playlist.index--;
        if (!!skip && skip >= 0) previous(skip--);
        else {
            this.playlist.index = (this.playlist.index + this.playlist.size) % this.playlist.size; // just to get out of the negatives, and rotate.
            var track = this.playlist.jsonData.tracks[this.playlist.index];
            this.currentTrack.stream = track.stream_url;
            this.currentTrack.title = track.title;
            this.currentTrack.artist = track.user.username;
            this.currentTrack.timeMax = track.duration / 1000;
        }
    };

    this.isPlaying = function() {
        return this.currentTrack.playing;
    };
    this.getTitle = function() {
        return this.currentTrack.title;
    };
    this.getArtist = function() {
        return this.currentTrack.artist;
    };
    this.getOwner = function() {
        return this.playlist.owner;
    };

    this.setPlaylist = function(user, playlist, startIndex) {};
    this.getPlaylist = function() {
        return this.playlist;
    };
    this.getPlaylistName = function() {
        return this.playlist.name;
    };
    this.getPlaylistTrackIndex = function() {
        return this.playlist.index;
    };
    this.getPlaylistSize = function() {
        return this.playlist.size;
    };

    this.getTime = function() {
        return this.currentTrack.time;
    };
    this.getTimeMax = function() {
        return this.currentTrack.timeMax;
    };

    this.loadPlaylist = function(owner, name) {
        SC.resolve("https://soundcloud.com/" + owner + "/sets/" + name).then(function(res) {
            SC.get("/playlists/" + res.id).then(function(playlistData) {
                self.playlist.jsonData = playlistData;
                self.playlist.owner = owner;
                self.playlist.name = name;
                self.playlist.size = playlistData.tracks.length;
                self.playlist.index = -1;
                self.next();
            });
        });
    };

    this.loadPlaylist(SOUNDCLOUD_CONFIG.owner, SOUNDCLOUD_CONFIG.playlist);
}