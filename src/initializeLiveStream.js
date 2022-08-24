// const {exec} = require('child_process');
const path = require('path');

const getRtspUrl = require('./model/getRtspUrl');
//const transcodeStream = require('./transcodeStream');
const {KOGAS_STREAM} = require('./model/streamSrc');


async function initializeIndividualStream(streamName) {
    var rtsp_url = getRtspUrl(streamName);
    var playlist_file_path = path.join(__dirname, `../public${KOGAS_STREAM[streamName]}`);
    var segment_file_path = playlist_file_path.replace('stream.m3u8', '%d.ts');
    // transcodeStream(streamName, rtsp_url);

    console.log('playlist_file_path: ', playlist_file_path);
    console.log('segment_file_path: ', segment_file_path);

    // generate child process for ffmpeg execution
    // exec(`./run_ffmpeg.sh ${streamName} ${rtsp_url} ${playlist_file_path} ${segment_file_path}`, (err, stdout, stderr) => {
    //     if (err) {
    //         console.error(`exec error: ${err}`);
    //         return;
    //     }
    // });
}

function initializeLiveStream() {
    let streamNames = ['kogas_stream1', 'kogas_stream2', 'kogas_stream3', 'kogas_stream4'];
    for (var i = 0; i < streamNames.length; i++) {
        var streamName = streamNames[i];
        initializeIndividualStream(streamName);
    }
}

module.exports = {initializeLiveStream};