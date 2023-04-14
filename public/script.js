// const { collection } = require("../models/assetType");

// const socket = io('/');
var socket = io('https://assetmanger.herokuapp.com/');

const videoGrid = document.getElementById('video-grid')
// let auditLocationGrab = document.querySelector('#auditLocation');
let mapAssetGrab;

let auditLocationGrab = document.getElementById('auditLocation');
console.log(videoGrid);
console.log(auditLocationGrab);
auditLocationGrab.addEventListener('click', function(){
    socket.emit('Auditor Location Move', (val) => {
        auditLocationActGrab.disabled = val;
    });
    auditLocation();
})

let auditLocationActGrab =  document.getElementById('auditLocationAct');
let auditWatchLocationGrab = document.querySelector('#auditWatchLocation');
auditWatchLocationGrab.addEventListener('click', function(){
    watchPosition();
})
let locationStatusGrab = document.querySelector('#locationStatus');

let addVidButGrab = document.getElementById('addVidBut');

//  const myPeer = new Peer(undefined, {
//             host:'/',
//             port:'3001'
//         })

const myPeer = new Peer(undefined, {
    secure:true,
    host:'0.peerjs.com',
    port:'443'
})

const myVideo = document.createElement('video');
myVideo.muted = true;

myPeer.on('open', id=>{
    console.log('User Connected...:', id)
    socket.emit('join-room2', Room_ID, id);
});

const peers = {}

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream =>{
    console.log('Adding first video...');
    console.log(stream);
addVideoStream(myVideo, stream, 'green');

myPeer.on('call', call=>{
    console.log('First Call...');
    call.answer(stream)
    
    const video = document.createElement('video');
    call.on('stream', userVideoStream=>{
        console.log('Answering first call...');
        console.log(userVideoStream);
        addVideoStream(video,userVideoStream, 'yellow');
    })
    
})
socket.on('user-connected', userId=>{
    // connectToNewUser(userId, stream);
    console.log(stream);
    console.log('User connected production...', userId);
    //function, closure. button on room.ejs
    // (function(userId, stream){
    //     addVidButGrab.addEventListener('click',  function(){
            alert('Clicked!');
            connectToNewUser(userId,stream, 'brown');
    //     })
    // })(userId, stream)
    // setTimeout(connectToNewUser,1000,userId,stream)
})
})

socket.on('user-disconnected', userId=>{
    console.log('User disconnected...');
    if(peers[userId]){
        peers[userId].close()
    }
})


function connectToNewUser(userId, stream, col){
    console.log('Inside connectToNewUser');
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video')
    call.on('stream', userVideoStream=>{
        console.log('Answering...');
        console.log(userVideoStream);
        addVideoStream(video, userVideoStream, col)
    })
    call.on('close', ()=>{
        video.remove();
    })

    peers[userId]= call;
}

function addVideoStream(video, stream, col){
    console.log('Adding...', col);
    console.log(stream);
    console.log(video);
    video.srcObject = stream;
    video.style.borderColor = col;
    video.addEventListener('loadedmetadata', ()=>{
        video.play()
    })
    videoGrid.append(video);
}


function auditLocation(){
    alert()
    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
    
        locationStatusGrab.textContent = `${latitude} and ${longitude}`;
        // mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        // mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
        var locationMarker =  new google.maps.Marker({
                            position: {lat:latitude, lng:longitude},
                            map:mapAssetGrab,
                            title: `Actual ${position.coords.accuracy}`,
                            draggable: true,
                            animation:google.maps.Animation.BOUNCE
                        });
      }
    
      function error() {
        locationStatusGrab.textContent = "Unable to retrieve your location";
      }
    
      if (!navigator.geolocation) {
        locationStatusGrab.textContent = "Geolocation is not supported by your browser";
      } else {
        locationStatusGrab.textContent = "Locating…";
        navigator.geolocation.getCurrentPosition(success, error);
      }
}


 function openMap(){
    // alert('Map');
    mapAssetGrab = new google.maps.Map(document.getElementById('mapView'), {zoom:6, center:{lat:9, lng:7}});
    console.log('This is location (from room.ejs), ', JSON.parse(locationAudit));  
    let locationAuditObj = JSON.parse(locationAudit);
    let locationAuditLat = +locationAuditObj.lat;
    let locationAuditLng = +locationAuditObj.lng;

    //Marker
        var locationMarker =  new google.maps.Marker({
            position:{lat:locationAuditLat, lng:locationAuditLng},
            map:mapAssetGrab,
            title: 'Expected',
            draggable: true,    
            // animation:google.maps.Animation.BOUNCE
        });
        console.log('This is marker ', locationMarker);
        console.log('This is marker ', locationMarker.getPosition());

    //circle 
    const cityCircle = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map:mapAssetGrab,
        center: locationMarker.getPosition(),
        radius: 20000,
      });
}

function watchPosition(){
    function success(pos) {
        const crd = pos.coords;
        // alert(crd)
        
        //conditionally render on map
        if (pos.coords.accuracy < 5000){
            alert('Now less than... ')
            var locationMarker2 =  new google.maps.Marker({
                position:{lat:crd.latitude, lng:crd.longitude},
                map:mapAssetGrab,
                title: 'Watch',
                draggable: true,    
                // animation:google.maps.Animation.BOUNCE
            });
            alert('Clearing');
            navigator.geolocation.clearWatch(id);
        }

        // mapAssetGrab.setPosition()
        // navigator.geolocation.clearWatch(id);
      }
      
      function error(err) {
        console.error(`ERROR(${err.code}): ${err.message}`);
      }
      
      
      options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0,
      };
      
      id = navigator.geolocation.watchPosition(success, error, options);
}

window.onload = function (){
    // alert('I have loaded');
    openMap();
}