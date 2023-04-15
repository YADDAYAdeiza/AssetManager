// const { collection } = require("../models/assetType");

// const socket = io('/');
var socket = io('https://assetmanger.herokuapp.com/');

socket.on('Enable Auditee Location', (val, posCoords)=>{
    alert(`setting to ${val}`);
    auditLocationActGrab.disabled = val;
    // auditLocation(posCoords)
})

socket.on('Plot Auditee Location', (pos, userId)=>{
    alert('Plotting Auditee location on Auditor Map')
    auditeeMarker =  new google.maps.Marker({
        position:{lat:pos.lat, lng:pos.lng},
        map:mapAssetGrab,
        title: 'Actual',
        draggable: true,    
        // animation:google.maps.Animation.BOUNCE
    });

    let distance = haversine_distance(locationMarker, auditeeMarker);
    alert('Distance is: ' + distance);
    markerDistanceGrab.innerHTML = distance;

    //progress Checks

    //Location Progress Check
        if (distance < allowedDistance){
            locationProgressGrab.classList.add('pass')
        }else{
            locationProgressGrab.classList.add('noPass');
        }
    
    //Owner progress Check
    console.log(userID) //from auditor
    console.log(userId)//from auditee
    if (userID == userId){
        alert('User confirmed');
        ownerProgressGrab.classList.add('pass');
    }else{
        alert('Not user')
        ownerProgressGrab.classList.add('noPass');
    }
})

const videoGrid = document.getElementById('video-grid')
// let auditLocationGrab = document.querySelector('#auditLocation');
let mapAssetGrab;
let auditeeMarker;
let locationMarker;
let markerDistanceGrab;
    markerDistanceGrab = document.getElementById('markerDistance');

//progress bars
let locationProgressGrab;
    locationProgressGrab = document.getElementById('locationProgress');
let ownerProgressGrab;
    ownerProgressGrab = document.getElementById('ownerProgress');

let allowedDistance;
    allowedDistance = 20;


let auditLocationGrab = document.getElementById('auditLocation');
console.log(videoGrid);
console.log(auditLocationGrab);

// auditLocationGrab.addEventListener('click', function(){
//     auditLocation();
// })


let auditLocationActGrab =  document.getElementById('auditLocationAct');
    auditLocationActGrab.addEventListener('click', function(){
        auditLocation();
    })
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
    // alert()
    function success(pos) {
        const latitude = pos.coords.latitude; 
        const longitude = pos.coords.longitude;
    
        locationStatusGrab.textContent = `${latitude} and ${longitude}`;
        // mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        // mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
        var locationMarkerAuditee =  new google.maps.Marker({
                            position: {lat:latitude, lng:longitude},
                            map:mapAssetGrab,
                            title: `Actual ${pos.coords.accuracy}`,
                            draggable: true,
                            animation:google.maps.Animation.BOUNCE
                        });
                        alert(pos.coords.latitude)

            socket.emit('Auditee Location', locationMarkerAuditee.getPosition(), userID);
      }
    
      function error() {
        locationStatusGrab.textContent = "Unable to retrieve your location";
      }
    
      if (!navigator.geolocation) {
        locationStatusGrab.textContent = "Geolocation is not supported by your browser";
      } else {
        locationStatusGrab.textContent = "Locating…";
        // if (posCoords){
        //     alert('Manual invocation');
        //     success(posCoords)
        // }else{
            navigator.geolocation.getCurrentPosition(success, error);
        // }
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
        locationMarker =  new google.maps.Marker({
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
        radius: allowedDistance,//20000
      });

      socket.emit('join-room-audit', '232AuditRoom', locationMarker.getPosition());
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

// settingsObj
var settingsObj2 = JSON.parse(settingsObj);
        console.log('settings: ', settingsObj2);
        console.log('Now here show');

        var settingsObjKeys = (Object.keys(settingsObj2));
        var settingsObjValues = (Object.values(settingsObj2));
        settingsObjKeys.forEach(className=>{
            [ ...document.getElementsByClassName(className)].forEach(elm=>{
                elm.style.display = settingsObj2[className];
            })
        })
        console.log(Object.values(settingsObj2));



        function haversine_distance(mk1, mk2) {
            var R = 6371.0710; // Radius of the Earth in miles
            var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
            var rlat2 = mk2.position.lat() * (Math.PI/180); // Convert degrees to radians
            var difflat = rlat2-rlat1; // Radian difference (latitudes)
            var difflon = (mk2.position.lng()-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)
      
            var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
            return d;
          }

window.onload = function (){
    // alert('I have loaded');
    openMap();
}