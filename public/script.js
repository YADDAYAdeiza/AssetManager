// const { collection } = require("../models/assetType");

const socket = io('/');
const videoGrid = document.getElementById('video-grid')
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
    video.srcObject = stream;
    video.style.borderColor = col;
    video.addEventListener('loadedmetadata', ()=>{
        video.play()
    })
    videoGrid.append(video);
}