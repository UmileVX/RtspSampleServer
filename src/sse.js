const express = require('express');
const sse_router = express.Router();

const SSE_RESPONSE_HEADER = {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
};
const INTERVAL_TIME = 60000; // 60 seconds
var subscribers = [];
var send_msg_id = 1;


sse_router.get('/', (req, res) => {
    // Writes response header.
    res.writeHead(200, SSE_RESPONSE_HEADER);

    generate_publish_loop_async(req, res, setup_subscription_cb);
});


async function generate_publish_loop_async(req, res, cb) {
    res.write('retry: 1000\n\n');
    //TODO objectCount(res, send_msg);

    var interval_id = setInterval(() => {
        //TODO objectCount(res, send_msg);
    }, INTERVAL_TIME);

    // setup the subscription by calling the callback
    setup_subscription_cb(req, res, interval_id);

    return interval_id;
}

function setup_subscription_cb(req, res, id) {
    var subscriber_obj = {id: id, res: res};
    subscribers.push(subscriber_obj);

    res.on('close', () => {
        console.log('req closed');
    });

    req.on('end', () => {
        clearInterval(id);

        //remove from subscribers
        remove_subscriber_by_id(id);
    });
}

async function send_msg(res, msg) {
    res.write('event: message\n')
    res.write(`id: ${send_msg_id++}\n`)
    res.write(`data: ${msg}\n\n`);
}

async function send_msg_to_all(msg) {
    subscribers.map(s => {
        var {res} = s;
        send_msg(res, msg);
    });
}

async function refresh_all_subscribers() {
    let msg = `REFRESH\n\n`;
    send_msg_to_all(msg);
}

async function remove_subscriber_by_id(target_id) {
    subscribers = subscribers.filter(s => {
        return s.id != target_id;
    });
}


module.exports = {sse_router, send_msg_to_all, refresh_all_subscribers};