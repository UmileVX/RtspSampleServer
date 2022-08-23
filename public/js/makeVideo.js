const Hls = require('hls.js');

function makeVideo(streamName, src, playerId, hlsMap, flag) {
    var quality;
    if (flag) {
        quality = '저화질';
    } else quality = '원본 화질';
    
    var config = {
        "initialLiveManifestSize": 3,
        "liveSyncDurationCount": 3,
        "liveMaxLatencyDurationCount": 5
    }

    const playerElement = document.getElementById(playerId);
    var hls = new Hls(config);
    hls.loadSource(src);
    hls.attachMedia(playerElement);

    hls.on(Hls.Events.MEDIA_ATTACHED, (event,data) => {
        hlsMap.set(playerId, hls);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, (event,data) => {
        console.log(streamName + ' ' + quality + ' Streaming Start');
        console.log(data);
    });

    hls.on(Hls.Events.ERROR, (event,data) => {
        console.log(streamName);
        console.log(data);

        if(data.fatal) {
            switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.log('fatal network error encountered, try to recover');
                    hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('fatal media error encountered, try to recover');
                    hls.recoverMediaError();
                    break;
            }
        }
    });
}

module.exports = makeVideo;