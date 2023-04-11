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

const peers = {}

navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream =>{
    console.log('Adding first video...');
addVideoStream(myVideo, stream);

myPeer.on('call', call=>{
    console.log('First Call...');
    call.answer(stream)
    
    const video = document.createElement('video');
    call.on('stream', userVideoStream=>{
        console.log('Answering first call...');
        console.log(userVideoStream);
        addVideoStream(video,userVideoStream)
    })
    
})
socket.on('user-connected', userId=>{
    // connectToNewUser(userId, stream);
    console.log(stream);
    console.log('User connected production...', userId);
    //function, closure. button on room.ejs
    (function(userId, stream){
        addVidButGrab.addEventListener('click',  function(){
            connectToNewUser(userId,stream);
        })
    })(userId, stream)
    // setTimeout(connectToNewUser,1000,userId,stream)
})
})

socket.on('user-disconnected', userId=>{
    console.log('User disconnected...');
    if(peers[userId]){
        peers[userId].close()
    }
})

myPeer.on('open', id=>{
    console.log('User Connected...:', id)
    socket.emit('join-room', Room_ID, id);
})

function connectToNewUser(userId, stream){
    console.log('Inside connectToNewUser');
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video')
    call.on('stream', userVideoStream=>{
        console.log('Answering...');
        console.log(userVideoStream);
        addVideoStream(video, userVideoStream)
    })
    call.on('close', ()=>{
        video.remove();
    })

    peers[userId]= call;
}

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', ()=>{
        video.play()
    })
    videoGrid.append(video);
}