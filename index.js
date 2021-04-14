'use strict';
//kod z prednasek
//spusteni videa 
const mediaStreamConstraints = {        // Definice omezeni –jen video
    video: true,
};
const localVideo = document.querySelector('video');  // Odkaz na videoelementv HTML
let localStream;            // Definice streamu pro video -let definuje proměnnou pouze v daném bloku
function gotLocalMediaStream(mediaStream) {         // Úspěšné získání streamu
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
};
function handleLocalMediaStreamError(error) {           // Zpracování chyby
    console.log('navigator.getUserMediaerror: ', error);
}
// Inicializace mediastreamu
navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(gotLocalMediaStream).catch(handleLocalMediaStreamError);


//manipulace s videem
$("#record").click(() => {
    if ($("#record").text() === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
        $("#record").text('Start Recording');
        $("#play").prop("disabled", false);
        $("#download").prop("disabled", false);
    }
});

let mediaRecorder;
let recordedBlobs;
let sourceBuffer;
const recordedVideo = document.getElementById('video');

function startRecording() {
    recordedBlobs = [];
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: '' };
            }
        }
    }

    try {
        mediaRecorder = new MediaRecorder(localStream, options);
    } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);

        return;
    }
    $("#record").text('Stop Recording');
    $("#play").prop("disabled", true);
    $("#download").prop("disabled", true);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
}

function stopRecording() {
    mediaRecorder.stop();
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

$("#play").click(() => {
    const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.controls = true;
    recordedVideo.play();
});


$("#download").click(() => {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
});


//manipulace s fotografií
var canvas = null;
canvas = document.getElementById('canvas');
$("#shot").click(() => {
    var width = recordedVideo.width;
    var height = recordedVideo.height / 1.35;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    var context = canvas.getContext('2d');
    context.drawImage(recordedVideo, 0, 0, width, height);
    $("#downloadImage").prop("disabled", false);
});
$("#downloadImage").click(() => {
    var image = canvas.toDataURL("image/png");
    var link = document.createElement('a');
    link.download = "my-image.png";
    link.href = image;
    link.click();
});