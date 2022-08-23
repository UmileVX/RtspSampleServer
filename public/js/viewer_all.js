const api = require('./api');
const makeVideo = require('./makeVideo');
const createEventSource = require('./createEventSource');



var hlsMap = new Map();
var KOGAS_STREAM = {};
var DOWNSCALE_STREAM = {};


const streams = ['kogas_stream1', 'kogas_stream2', 'kogas_stream3', 'kogas_stream4'];
const playerIds = ['player1', 'player2', 'player3', 'player4'];
var flags = [0,0,0,0];


function destroyHls(idx) {
    return new Promise((resolve) => {
        hlsMap.get(playerIds[idx]).destroy();
        hlsMap.delete(playerIds[idx]);
        console.log("HLS Destroyed");
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
    makeVideo(streams[idx], KOGAS_STREAM[streams[idx]], playerIds[idx], hlsMap, flag);
}

// flag == 1 일때 저화질, flag == 0 일때 원본
window.onClickChangeQuality = async function(btn) {
    var idx = btn.id - 1;
    var flag = flags[idx];
    var player = document.getElementById(playerIds[idx]);
    if (flag) {
        await destroyHls(idx);
        makeVideo(streams[idx], KOGAS_STREAM[streams[idx]], playerIds[idx], hlsMap, flag);
        player.style.width = '800px';
        player.style.height = '550px';
        btn.innerText = '저화질';
        flags[idx] = 0;
    } else {
        await destroyHls(idx);
        makeVideo(streams[idx], DOWNSCALE_STREAM[streams[idx]], playerIds[idx], hlsMap, flag);
        player.style.width = '600px';
        player.style.height = '350px';
        btn.innerText = '원본 화질';
        flags[idx] = 1;
    }
}

async function startStreaming() {
    KOGAS_STREAM = await api.getKogasHlsSrc();
    // DOWNSCALE_STREAM = await api.getDownscaleSrc();

    var dataLength = Object.keys(KOGAS_STREAM).length;
    var src;

    for(var i=0; i<dataLength; i++) {
        src = KOGAS_STREAM[streams[i]];
        makeVideo(streams[i], src, playerIds[i], hlsMap, 0);
    }

    console.log('Build server-sent event listener');
    createEventSource(destroyHlsByStreamName, recoverHlsByStreamName);
}

startStreaming();