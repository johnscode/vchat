var localVideo;
var localStream;
var remoteVideo;
var peerConnection;
var uuid;
var serverConnection;
var channel;

var peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

function pageReady() {
  uuid = createUUID();
  console.log(`my uuid ${uuid}`)

  localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  serverConnection = new WebSocket('ws://' + window.location.hostname + ':4000');
  serverConnection.onmessage = gotMessageFromServer;

  var constraints = {
    video: true,
    audio: true,
  };

  if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
  } else {
    alert('Your browser does not support getUserMedia API');
  }

}

function getUserMediaSuccess(stream) {
  localStream = stream;
  localVideo.srcObject = stream;
}

function joinRoom(room,user) {
  serverConnection.send(JSON.stringify({join:room,user:user}));
}

// we dont use this with webrtc, we use the channel mechanism
// async function sendMsg(msg) {
//   serverConnection.send(JSON.stringify({room:'a room id',msg:msg}));
//   serverConnection.send(JSON.stringify({msg:`send-only: ${msg}`}));
// }

function sendChannelMessage(msg){
  channel.send(JSON.stringify({
    "message": msg
  }));
}

function gotData(event) {
  channel = event.channel;
  setChannelEvents(channel);
}

function hangup(event) {
  sendChannelMessage(JSON.stringify({hangup: uuid}));
  remoteVideo.srcObject = null;

  if(channel){
    channel.close();
    channel=null
  }
  if(peerConnection){
    peerConnection.close();
    peerConnection=null;
  }
}

function setChannelEvents(channel) {
  channel.onmessage = function (event) {
    var data = JSON.parse(event.data);
    console.log(`channel data- ${event.data}`);
  };

  channel.onerror = function (event) {
    console.log('DataChannel Error.');
    console.error(event)
  };

  channel.onclose = function (event) {
    console.log('DataChannel Closed.');
  };
}


function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.ontrack = gotRemoteStream;
  peerConnection.ondatachannel = gotData;
  peerConnection.addStream(localStream);

  if(isCaller) {
    if(channel){
      channel.close();
    }
    // Create Data channel
    channel = peerConnection.createDataChannel('channel', {uuid: 'a room id'});
    setChannelEvents(channel);
    peerConnection.createOffer().then(createdDescription).catch(errorHandler);
  }
}

function gotMessageFromServer(message) {
  if(!peerConnection) start(false);

  var signal = JSON.parse(message.data);

  // Ignore messages from ourself
  if(signal.uuid == uuid) return;

  console.log(`socket data: ${JSON.stringify(message.data)}`);

  if(signal.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
      // Only create answers in response to offers
      if(signal.sdp.type == 'offer') {
        peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
      }
    }).catch(errorHandler);
  } else if(signal.ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
  } else {
    console.log(`not a webrtc msg: ${JSON.stringify(message.data)}`);
    if (signal.joined) {

    }
  }
}

function gotIceCandidate(event) {
  if(event.candidate != null) {
    serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
  }
}

function createdDescription(description) {
  console.log('got description');

  peerConnection.setLocalDescription(description).then(function() {
    serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
  }).catch(errorHandler);
}

function gotRemoteStream(event) {
  console.log(`gotRemoteStream remote ${JSON.stringify(peerConnection.remoteDescription)}`)
  console.log(`gotRemoteStream local ${JSON.stringify(peerConnection.localDescription)}`)
  console.log(`gotRemoteStream ${JSON.stringify(peerConnection.peerIdentity)}`)
  remoteVideo.srcObject = event.streams[0];
  // hangup = document.getElementById('hangup');
  $('#hangup').prop('disabled', false);;
}

function errorHandler(error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
