const stream = navigator.mediaDevices.getUserMedia({ video: true, audio: true });
document.querySelector('#localVid').srcObject = stream;