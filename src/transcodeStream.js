const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');


function transcodeStream(streamName, url) {
    function ffmpeg_callback() {
        console.log(`ffmpeg_callback :: ${streamName} ended!`);
    }

    var path = __dirname + `/public/playlist/${streamName}`;

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive:true});
    }


    ffmpeg()
    .input(url)
    .inputOptions(['-rtsp_transport tcp'])
    // ffmpeg(url, { timeout: 432000 })
    .addOptions([
        "-f hls",
        '-c:v libx264',
        '-c:a aac',
        '-ac 1',
        '-strict -2',
        '-crf 18',
        '-profile:v baseline',
        '-maxrate 400k',
        '-bufsize 1835k',
        '-pix_fmt yuv420p',
        '-hls_time 10',
        '-hls_list_size 6',
        '-hls_wrap 10',
        '-start_number 1'
    ])
    .output(path + '/stream.m3u8')
    .on('end', ffmpeg_callback)
    .run();

    // .outputOptions([
    //     "-f hls",
    //     "-vf scale=854:480,setsar=1",
    //     "-crf 40",
    //     "-c:v libx264",
    //     "-b:v 800k",
    //     "-maxrate 1000k",
    //     "-sc_threshold 0",
    //     "-preset veryfast",
    //     "-force_key_frames expr:gte(t,n_forced*2)",
    //     "-hls_time 2",
    //     "-hls_list_size 3",
    //     "-hls_delete_threshold 1",
    //     "-hls_flags split_by_time",
    //     "-hls_flags delete_segments"
    // ])
    // .on('error', (err) => {
    // })
    // .run();
    
    console.log(streamName + ' transcode start');
}

module.exports = transcodeStream;