const getRtspUrl = require('./getRtspUrl');
const transcodeStream = require('./transcodeStream');
const {KOGAS_STREAM} = require('./streamSrc');


async function initializeIndividualStream(streamName) {
    var rtsp_url = getRtspUrl(streamName);
    transcodeStream(streamName, rtsp_url);
}

function initializeLiveStream() {
    let streamNames = ['kogas_stream1', 'kogas_stream2', 'kogas_stream3', 'kogas_stream4'];
    for (var i = 0; i < streamNames.length; i++) {
        var streamName = streamNames[i];
        initializeIndividualStream(streamName);
    }
}

module.exports = {initializeLiveStream};