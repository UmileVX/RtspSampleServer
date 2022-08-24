const express = require('express');
const logger = require('morgan');
const path = require('path');
const fs = require('fs');


require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname + '/public/pages';
const PLAYLIST_DIR = __dirname + '/public/playlist';
const exitEvent = ['SIGINT', 'uncaughtException', 'SIGUSR1', 'SIGUSR2'];

const {initializeLiveStream} = require('./src/initializeLiveStream');
const {KOGAS_STREAM} = require('./src/model/streamSrc');
const {sse_router, send_msg_to_all} = require('./src/sse');


app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));


// Show pages
app.get('/', (req,res) => {
    // res.status(200).sendFile(PUBLIC_DIR + '/index.html');
    res.redirect('/viewer/all');
});

// Return HLS URL
app.get('/stream/hls-url', (req,res) => {
    res.status(200).json(KOGAS_STREAM);
});


app.get('/recover', (req, res) => {
    var {streamName} = req.query;
    if (streamName in KOGAS_STREAM) {
        var msg = `recover=${streamName}`;
        send_msg_to_all(msg);
        res.status(200).send('sse sent successfully');
        return;
    }
    res.status(404).send('Invalid stream name!');
});
app.get('/crash', (req, res) => {
    var {streamName} = req.query;
    if (streamName in KOGAS_STREAM) {
        var msg = `crash=${streamName}`;
        send_msg_to_all(msg);
        res.status(200).send('sse sent successfully');
        return;
    }
    res.status(404).send('Invalid stream name!');
});
app.use('/sse', sse_router);


//--------------------------------------------------------------------------------
// Endpoints for viewers

app.get('/viewer/all', (req,res) => {
    res.status(200).sendFile(PUBLIC_DIR + '/viewer_all.html');
});

// app.get('/viewer/stream1', (req,res) => {
//     res.status(200).sendFile(PUBLIC_DIR + '/viewer_stream1.html');
// });

// app.get('/viewer/stream2', (req,res) => {
//     res.status(200).sendFile(PUBLIC_DIR + '/viewer_stream2.html');
// });

// app.get('/viewer/stream3', (req,res) => {
//     res.status(200).sendFile(PUBLIC_DIR + '/viewer_stream3.html');
// });

// app.get('/viewer/stream4', (req,res) => {
//     res.status(200).sendFile(PUBLIC_DIR + '/viewer_stream4.html');
// });

// Return downscale m3u8
// app.get('/stream/downscale-m3u8', (req,res) => {
//     res.status(200).json(DOWNSCALE_STREAM);
// })

//--------------------------------------------------------------------------------

const server = app.listen(port, () => {
    initializeLiveStream();
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exitEvent.forEach((eventType) => {
    process.on(eventType, () => {
        server.close();
        console.log('');
        console.log('Server Exit');
    
        delay(2000).then(() => {
            for (const stream in KOGAS_STREAM) {
                const dir = PLAYLIST_DIR + `/${stream}/`;
                
                fs.readdirSync(dir).forEach(file => {
                    fs.unlinkSync(dir + file);
                });
            }
            process.exit();
        });
    });
});
