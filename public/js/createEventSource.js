var eventSource;

function createEventSource(onCrash_cb, onRecover_cb) {
    eventSource = new EventSource(`/sse`);

    eventSource.onmessage = function(e) {
        var data = e.data;
        console.log('onmessage');
        console.log(data);

        if (data.includes('REFRESH')) {
            // refresh web
            window.location.reload();
        } else if (data.includes('crash=')) {
            var crashed_stream_name = data.split('=')[1];
            onCrash_cb(crashed_stream_name);
        } else if (data.includes('recover=')) {
            var recovered_stream_name = data.split('=')[1];
            onRecover_cb(recovered_stream_name);
        } else {
            //TODO
        }
    }

    eventSource.addEventListener('open', function(e) {
        console.log('EventSource opened');
        console.log(e.target);
    });

    eventSource.onerror = function(e) {
        console.log('createEventSource -> eventSource.onerror :', e);
    }
}

module.exports = createEventSource;