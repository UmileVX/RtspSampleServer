const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

function transcodeStream(streamName, url) {
    var path = __dirname + `/public/playlist/${streamName}`;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive:true});
    }

    ffmpeg(url)
    .output(path + '/480p.m3u8')
    .outputOptions([
        "-f hls",
        "-vf scale=854:480,setsar=1",
        "-crf 40",
        "-c:v libx264",
        "-b:v 800k",
        "-maxrate 1000k",
        "-sc_threshold 0",
        "-preset veryfast",
        "-force_key_frames expr:gte(t,n_forced*2)",
        "-hls_time 2",
        "-hls_list_size 3",
        "-hls_delete_threshold 1",
        "-hls_flags split_by_time",
        "-hls_flags delete_segments"
    ])
    .on('error', (err) => {
    })
    .run();
    
    console.log(streamName + ' transcode start');
}

module.exports = transcodeStream;