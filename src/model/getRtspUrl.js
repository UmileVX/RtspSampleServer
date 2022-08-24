const URL_MAP = require('./rtspUrl.json');


function getRTSPUrl(streamName) {
    if (streamName in URL_MAP) {
        return URL_MAP[streamName];
    }
    return undefined;
}

module.exports = getRTSPUrl;