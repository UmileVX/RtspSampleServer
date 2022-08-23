var eventSource;

function createEventSource() {
    eventSource = new EventSource(`/subscribe`);

    eventSource.onmessage = function(e) {
        var data = e.data;
        console.log('onmessage');
        console.log(data);

        if (data.includes('REFRESH')) {
            // refresh web
            window.location.reload();
        } else if (data.includes('crash')) {
            var crashed_stream_name = data.split('=')[1];
            //TODO
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
