const axios = require('axios');

axios.default.baseURL = 'http://localhost:3000';

export async function getAwsHlsSrc() {
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