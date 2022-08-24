const api = require('./api');
const makeVideo = require('./makeVideo');
const createEventSource = require('./createEventSource');



var hlsMap = new Map();
var KOGAS_STREAM = {};
var DOWNSCALE_STREAM = {};


const refresh_interval = 30000;
const reload_interval = 40000;
const streams = ['kogas_stream1', 'kogas_stream2', 'kogas_stream3', 'kogas_stream4'];
const playerIds = ['player1', 'player2', 'player3', 'player4'];
var flags = [0,0,0,0];

//---------------------------------------------------------------------------
// Video

function handleVideoEvent(evt) {
    try {
        var target_id = evt.target.id;
        switch (evt.type) {
            case 'ended':
                // regenerate stream (or refresh the stream)
                console.log(target_id);
                var idx = playerIds.indexOf(target_id);
                regenerateStreamByStreamName(streams[idx]);
                break;

            case 'error':
                let errorTxt;
                const mediaError = evt.currentTarget.error;

                var idx = playerIds.indexOf(target_id);
                console.log('Error on stream: ', streams[idx]);

                // use switch statement to figure out the media error code, so that the system could handle the error properly.
                switch (mediaError.code) {
                    case mediaError.MEDIA_ERR_ABORTED:
                        errorTxt = 'You aborted the video playback';
                        break;

                    case mediaError.MEDIA_ERR_DECODE:
                        errorTxt = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support';
                        break;

                    case mediaError.MEDIA_ERR_NETWORK:
                        errorTxt = 'A network error caused the video download to fail part-way';
                        break;

                    case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        errorTxt = 'The video could not be loaded, either because the server or network failed or because the format is not supported';
                        break;
                }

                // check if there is any additional provided media error message.
                if (mediaError.message) errorTxt += ' ::: ' + mediaError.message;
                console.log(errorTxt);
                break;
            default:
                break;
        }
    } catch {
        console.log('Error occurred whild handling event: ', evt);
    }
}

function addVideoEventListeners(video) {
    console.log('Add event listeners: ', video);
    video.addEventListener('ended', handleVideoEvent);
    video.addEventListener('error', handleVideoEvent);
}

function checkIfVideoIsPlaying(videoId) {
    const video = document.getElementById(videoId);
    let isPlaying = (video.currentTime > 0) && (!video.paused) && (!video.ended) && (video.readyState > 2);
    return isPlaying;
}

//---------------------------------------------------------------------------
// Handling HLS streams

function destroyHls(idx) {
    return new Promise((resolve) => {
        try {
            hlsMap.get(playerIds[idx]).destroy();
            hlsMap.delete(playerIds[idx]);
            console.log("HLS Destroyed");
        } catch {
            console.log('No need to destroy');
        }
        resolve();
    });
}

async function destroyHlsByStreamName(streamName) {
    var idx = streams.indexOf(streamName);
    await destroyHls(idx);
}

async function recoverHlsByStreamName(streamName) {
    var idx = streams.indexOf(streamName);
    var flag = flags[idx];
    const streamPath = KOGAS_STREAM[streamName];
    const isPlayable = await api.checkIfStreamIsPlayable(streamPath);

    if (isPlayable) {
        makeVideo(streams[idx], streamPath, playerIds[idx], hlsMap, flag);
    } else {
        // setTimeout(() => {
        //     loadPlayableStreamOnly(idx, streamPath);
        // }, reload_interval);
    }
}

async function regenerateStreamByStreamName(streamName) {
    await destroyHlsByStreamName(streamName);
    await recoverHlsByStreamName(streamName);
}

async function loadPlayableStreamOnly(idx, streamPath) {
    const isPlayable = await api.checkIfStreamIsPlayable(streamPath);
    if (isPlayable) {
        makeVideo(streams[idx], streamPath, playerIds[idx], hlsMap, flags[i]);
    } else {
        // do nothing when the stream is not playable
        console.log('Failed to play :: ', streamPath);
    }
    return isPlayable;
}

//---------------------------------------------------------------------------
// Main part

async function refreshPausedStreams() {
    for (var i = 0; i < playerIds.length; i++) {
        var playerId = playerIds[i];
        var isPlaying = checkIfVideoIsPlaying(playerId);
        if (!isPlaying) {
            await regenerateStreamByStreamName(streams[i]);
        }
    }
}

async function startStreaming() {
    KOGAS_STREAM = await api.getKogasHlsSrc();
    // DOWNSCALE_STREAM = await api.getDownscaleSrc();

    // get length of stream data
    var dataLength = Object.keys(KOGAS_STREAM).length;
    var src;

    // get list for playable videos
    var playables = await api.getPlayableStreamList(KOGAS_STREAM);

    for (var i=0; i<dataLength; i++) {
        src = KOGAS_STREAM[streams[i]];
        const playerId = playerIds[i];
        var video = document.getElementById(playerId);
        addVideoEventListeners(video);

        // only make videos for playable ones
        if (playables[i]) makeVideo(streams[i], src, playerId, hlsMap, 0);
    }

    console.log('Build server-sent event listener');
    createEventSource(destroyHlsByStreamName, recoverHlsByStreamName);

    //TODO create interval loop for refresh crashed streams
    setInterval(() => {
        refreshPausedStreams();
    }, refresh_interval);
}

startStreaming();


// flag == 1 일때 저화질, flag == 0 일때 원본
// window.onClickChangeQuality = async function(btn) {
//     var idx = btn.id - 1;
//     var flag = flags[idx];
//     var player = document.getElementById(playerIds[idx]);
//     if (flag) {
//         await destroyHls(idx);
//         makeVideo(streams[idx], KOGAS_STREAM[streams[idx]], playerIds[idx], hlsMap, flag);
//         player.style.width = '800px';
//         player.style.height = '550px';
//         btn.innerText = '저화질';
//         flags[idx] = 0;
//     } else {
//         await destroyHls(idx);
//         makeVideo(streams[idx], DOWNSCALE_STREAM[streams[idx]], playerIds[idx], hlsMap, flag);
//         player.style.width = '600px';
//         player.style.height = '350px';
//         btn.innerText = '원본 화질';
//         flags[idx] = 1;
//     }
// }