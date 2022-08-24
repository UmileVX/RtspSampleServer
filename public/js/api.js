const axios = require('axios');

axios.default.baseURL = 'http://localhost:3000';

export async function getKogasHlsSrc() {
    try {
        const res = await axios.get('/stream/hls-url');
        return res.data;
    } catch(err) {
        console.log(err);
    }
}

export async function getDownscaleSrc() {
    try {
        const res = await axios.get('/stream/downscale-m3u8');
        return res.data;
    } catch(err) {
        console.log(err);
    }
}

export async function checkIfStreamIsPlayable(stream) {
    try {
        const res = await axios.get(stream);
        console.log(`${stream}`, res);
        return true;
    } catch (err) {
        console.log(err);
    }
    return false;
}

export async function getPlayableStreamList(streams) {
    try {
        var keys = Object.keys(streams);
        let playable = [];
        for (var i = 0; i < keys.length; i += 1) {
            const key = keys[i];
            const stream_path = streams[key];
            let isPlayable = await checkIfStreamIsPlayable(stream_path);
            playable.push(isPlayable);
        }
        return playable;
    } catch (err) {
        console.log(err);
    }
}
