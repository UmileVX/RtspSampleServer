const URL_MAP = {
    kogas_stream1: 'rtsp://192.168.11.102:8123/ds-test',
    kogas_stream2: 'rtsp://192.168.11.102:8123/ds-test',
    kogas_stream3: 'rtsp://192.168.11.102:8123/ds-test',
    kogas_stream4: 'rtsp://192.168.11.102:8123/ds-test',
}


function getRTSPUrl(streamName) {
    if (streamName in URL_MAP) {
        return URL_MAP[streamName];
    }
    return undefined;
}

module.exports = getRTSPUrl;