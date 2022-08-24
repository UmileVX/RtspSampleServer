#!/bin/bash

streamName=$1
rtsp_url=$2
playlist_file_path=$3
segment_file_path=$4


# Setting to stop while loop
finish=0
trap 'finish=1' SIGUSR1

while (( finish != 1 ))
do
    curl --head --connect-timeout 1 -i -X OPTIONS $rtsp_url

    while [ $? -ne 0 ]
    do
        sleep 5
        curl --head --connect-timeout 1 -i -X OPTIONS $rtsp_url
    done

    echo "Rtsp stream is alive!"
    curl http://localhost:3000/recover?streamName=$streamName

    # run ffmpeg
    echo "FFMPEG to transport rtsp :: ${rtsp_url}"
    # execute ffmpeg
    ffmpeg -fflags nobuffer -rtsp_transport tcp -i $rtsp_url -vsync 0 \
    -copyts -vcodec copy -movflags frag_keyframe+empty_moov -an -hls_flags delete_segments \
    -f hls -hls_delete_threshold 3 -hls_list_size 3 -hls_time 5 $playlist_file_path
    # ffmpeg -fflags nobuffer -rtsp_transport tcp -i $rtsp_url -vsync 0 \
    # -copyts -vcodec copy -movflags frag_keyframe+empty_moov -an -hls_flags delete_segments+append_list \
    # -f segment -segment_list_flags live -segment_time 10 -segment_list_size 3 -segment_format mpegts \
    # -segment_list $playlist_file_path -segment_list_type m3u8 $segment_file_path

    # only executed when the ffmpeg has been terminated
    echo "FFMPEG terminated"
    echo "Let the server know that the ffmpeg has been terminated!"
    curl http://localhost:3000/crash?streamName=$streamName
    echo ""

    echo "Sleep for 5 seconds"
    sleep 5

done
