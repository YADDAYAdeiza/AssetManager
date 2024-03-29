let auditResultObj2;
let auditResultObj ={passes:{}};
// const { collection } = require("../models/assetType");

// const socket = io('/');
var socket = io('https://assetmanger.herokuapp.com/');

socket.on('Enable Auditee Location', (val, posCoords)=>{
    alert(`setting to ${val}`);
    auditLocationActGrab.disabled = val;
    // auditLocation(posCoords)
})

socket.on('Plot Auditee Location', async (pos, userId, assetId)=>{
    auditResultObj = {passes:{}, assetStatus}
    alert('Plotting Auditee location on Auditor Map');
    console.log(pos);
    auditeeMarker =  new google.maps.Marker({
        position:{lat:pos.lat, lng:pos.lng},
        map:mapAssetGrab,
        title: 'Actual',
        draggable: true,    
        animation:google.maps.Animation.BOUNCE
    });

    let distance = haversine_distance(locationMarker, auditeeMarker);
    console.log('Distance is: ' + distance);
    markerDistanceGrab.innerHTML = distance;

    //progress Checks

    //Location Progress Check
        if (distance < allowedDistance/1000){//allowedDistance in Km
            console.log('Distance passed');
            locationProgressGrab.classList.add('pass')
            socket.emit('location-confirmed', 'pass');
            auditResultObj.passes.locationPass = true; //meaning 'passed'
            // alert('location');
            // let auditBtnGrab = document.getElementById('auditBtn').disabled = false;
            // console.log(auditBtnGrab);
            
        }else{
            console.log('Distance noPassed')
            locationProgressGrab.classList.add('noPass');
            socket.emit('location-confirmed', 'noPass');
            auditResultObj.passes.locationPass = false; //meaning 'failed'
            // alert('locatiom')
            // document.getElementById('auditBtn').disabled = false;
            // console.log(auditBtnGrab);

        }
        
        //Owner progress Check
        console.log('User Id from Auditor: ', userID) //from auditor
        console.log('User ID from Auditee sign-in ', userId)//from auditee
        if (userID == userId){
            alert('User confirmed');
            ownerProgressGrab.classList.add('pass');
            socket.emit('user-confirmed', 'pass');
            auditResultObj.passes.ownerPass = true; //meaning 'failed'
        }else{
            alert('Not user')
            ownerProgressGrab.classList.add('noPass');
            auditResultObj.passes.ownerPass = false; //meaning 'failed'
        }
        
        //Asset progress Check
        if (assetID == assetId){ 
            alert('asset confirmed');
            assetProgressGrab.classList.add('pass');
            socket.emit('asset-confirmed', 'pass');
            auditResultObj.passes.assetPass = true; //meaning 'failed'
        }else{
            alert('Not asset')
            assetProgressGrab.classList.add('noPass');
            auditResultObj.passes.assetPass = false; //meaning 'failed'
    }


    //fetch auditResultObj, and get feedback.  Tie it to
    var auditResult = await fetch(`/asset/assetHistory/${assetId}`);
        let dataResponse = await auditResult.json();
        console.log(dataResponse);

})

// socket.on('location-confirmed', (classVal)=>{
//     console.log(classVal);
//     socket.to(roomId).emit('location-confirmed2', classVal);
//     // socket.emit('user-confirmed2', classVal);
//   })

socket.on('location-confirmed2', classVal=>{
    alert('Addding classVal to auditee because it passed or noPassed');
    locationProgressGrab.classList.add(classVal);
});

socket.on('user-confirmed2', classVal=>{
    alert('Addding classVal');
    ownerProgressGrab.classList.add(classVal);
});
socket.on('asset-confirmed2', classVal=>{
    alert('Addding classVal');
    assetProgressGrab.classList.add(classVal);
});
    //   socket.emit('')

const videoGrid = document.getElementById('video-grid');
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
let assetProgressGrab;
    assetProgressGrab = document.getElementById('assetProgress');

let allowedDistance;
    allowedDistance = 20000;

let expectedPositionGrab;
    expectedPositionGrab = document.getElementById('expectedPosition');
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
    alert('Adding first video...');
    console.log(stream);
addVideoStream(myVideo, stream, 'green');

myPeer.on('call', call=>{
    console.log('First Call...');
    call.answer(stream)
    
    const video = document.createElement('video');
    call.on('stream', userVideoStream=>{
        alert('Answering first call...');
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
        alert('Answering...');
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

    let auditResultObj2 = auditResultObj;
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
                            title: `My Actual ${pos.coords.accuracy}`,
                            draggable: true,
                            animation:google.maps.Animation.BOUNCE
                        });
                        alert(pos.coords.latitude)
                        // locationStatusGrab.textContent = `Latitude ${latitude}, Longitude ${longitude}`;
            socket.emit('Auditee Location', locationMarkerAuditee.getPosition(), userID, assetID);
            alert('Locatiom')
            let auditBtnGrab = document.getElementById('auditBtn');
            auditBtnGrab.disabled = false;
            console.log(auditBtnGrab);  
            // let hiddenObjGrab = document.getElementById('hiddenObj')
            // hiddenObjGrab.value = auditResultObj.toString();
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
    alert('Open Map');
    mapAssetGrab = new google.maps.Map(document.getElementById('mapView'), {zoom:6, center:{lat:9, lng:7}});
    console.log('This is location (from room.ejs), ', JSON.parse(locationAudit));  
    let locationAuditObj = JSON.parse(locationAudit);
    let locationAuditLat = +locationAuditObj.lat;
    let locationAuditLng = +locationAuditObj.lng;

    //Marker
    alert('Coords')
    alert(+locationAuditObj.lat);
    alert(+locationAuditObj.lng);
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
      expectedPositionGrab.innerHTML = locationMarker.getPosition();
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

          async function AuditAsset(userId, assetId, auditorId, auditStatus, genId, postObj){
            alert('Auditing asset from video page');
            console.log('Asset status: ',auditStatus);
            console.log('auditResultObj ', auditResultObj);
            auditResultObj.assetStatus = auditStatus;
            console.log(auditResultObj);

            let auditUpdateObj = {
                assetId,
                // auditStatus,
                userId,
                auditorId,
                auditResult:auditResultObj,
                genId,
                postObj
            }
            alert('The object : ')
            console.log('The object : ', auditUpdateObj);
            
            let auditUpdate = await fetch(`/auditStatus2/${JSON.stringify(auditUpdateObj)}`, {redirect:"follow"});
            console.log('Intermediate -fetch status, ', auditUpdate)
            let getAuditUpdate = await auditUpdate.json();
            console.log('This is auditUpdate from another option ', getAuditUpdate); 
        }

window.onload = function (){
    // alert('I have loaded');
    openMap();
}