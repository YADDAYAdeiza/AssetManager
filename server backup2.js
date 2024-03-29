let userModel = require('./models/user');
let assetTypeModel = require('./models/assetType');
let assetTypeAuditModel = require('./models/assetType_Audit');

let savedSnapShotsModel = require('./models/savedSnapShots');

let {authenticateRole, authenticateRoleProfilePage, permitLists, permitListsLogin, hideNavMenu, permitApproval} = require('./basicAuth');


if (process.env.NODE_ENV !=='production'){
  var dotEnv =  require('dotenv');
  dotEnv.config();
}

// const { PeerServer } = require('peer');

// const peerServer = PeerServer({ port: 9000, path: '/assetmanger.herokuapp.com' });

// let {hideNavMenu} = require('./basicAuth');


let express = require('express');
//
const { ExpressPeerServer } = require('peer');
//
let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let mongoose = require('mongoose');
const QRCode = require('qrcode');
let app = express();
const http = require('http');
const https = require('https');
const methodOverride = require('method-override')
const bcrypt =  require('bcrypt');

let cors = require('cors');
const server = require('http').Server(app);
const io = require('socket.io')(server, {cors: {
  origin: "*",
  methods: ["GET", "POST"]
}});
const {v4:uuidV4} = require('uuid');
console.log('Adeiza');

// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);

// io.on('connection', (socket) => {
//     console.log('--------------------------------------------------')
//     console.log('a user connected', socket.id);
//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//   });
//   server.listen(3000, () => {
//     console.log('listening on *:3000');
//   });

// console.log(authenticateRole().toString());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https:127.0.0.1:2000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition');
  next();
});

app.use(cors({
  origin:"*",
  method:["GET", "POST", "PUT"],
  allowedHeaders: "*",
  exposedHeaders:"content-disposition"
}));

// app.use(cors({
//   origin:"https:127.0.0.1:2000",
//   method:["GET", "POST", "PUT"],
//   allowedHeaders: "*",
//   exposedHeaders:"content-disposition"
// }));

//authentication
let {role} = require('./role.js');



console.log(role);

// const userModel = require('models/user.js');


io.on('connection', socket=>{
  socket.on('join-room-audit',  (roomId, posCoords)=>{
    console.log(`Audit Room joined ${roomId}`);
    socket.join(roomId)
    // io.to(roomId).emit('Enable Auditee Location', false, posCoords);
    io.to(roomId).emit('Enable Auditee Location', false);

    socket.on('Auditee Location', (pos, userId, assetId)=>{
      console.log('Plotting auditee location: ', pos);
      socket.to(roomId).emit('Plot Auditee Location', pos, userId, assetId);
    })
    
    socket.on('location-confirmed', (classVal)=>{
      console.log('location confirmed: ', classVal);
      io.to(roomId).emit('location-confirmed2', classVal);
    })
    
    socket.on('user-confirmed', (classVal)=>{
      console.log(classVal);
      socket.to(roomId).emit('user-confirmed2', classVal);
      // socket.emit('user-confirmed2', classVal);
    })
    socket.on('asset-confirmed', (classVal)=>{
      console.log(classVal);
      socket.to(roomId).emit('asset-confirmed2', classVal);
      // socket.emit('user-confirmed2', classVal);
    })
    

  })

  
  socket.on('Auditor Location Move', (val)=>{
    console.log('This auditor location click ', val);
    val(false);
  });

  console.log('Connection established on Server Code...');
    socket.on('join-room2', (roomId, userId)=>{
      console.log('Joined now... 2');
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', userId)
      console.log(userId + ' joined '+ roomId);
      // socket.broadcast.to(roomId).emit("hello", "world");
      //socket.to(roomId).broadcast.emit('user-connected', userId)

      socket.on('disconnect', ()=>{
        socket.to(roomId).emit('user-disconnected', userId)
        // socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })

    socket.on('adminMonitoringTracking', (msg)=>{
      //join other sockets to this room
      console.log(msg)
      //assign variable to admin socket
      adminSocket = socket.id;
      console.log(adminSocket);

      io.emit('trackPlots', `Tracking... ${socket.id}`);
  })

  console.log('Connected now in 2001 on ', socket.id);
  // (function (adminSocket){
  socket.on('sendPos', (posMsg, room)=>{
      console.log(`here is message ${posMsg}`);
      console.log(`This is adminSocket ${adminSocket}`);
      if (adminSocket){
          console.log('...to admin now...')
          socket.to(adminSocket).emit('dutyOn', posMsg );
      }
  });
  socket.on('stopSendPos', (assetCodeMsg)=>{
      console.log('Stop ', assetCodeMsg);
      socket.to(adminSocket).emit('stopDutyOn', assetCodeMsg.assetCode );

  })

  //for video use
  let adminAvailableLightUp;
  socket.on('join-room', (roomId, userId)=>{
    console.log('Joined now...1 ' + userId);
      socket.join(roomId);
      if(userId.user !== 'admin'){ //joining from trackable asset
          console.log(userId);
          console.log('Enabling Track Button...');
          console.log(adminAvailableLightUp);
          // if (adminAvailableLightUp){
              console.log('Enable Track Button...')
              console.log(socket.id);
              console.log(socket.rooms);
              // io.to(roomId).emit('enableTrackBut');
              // try{
                  // socket.emit('enableTrackBut', 'Enabled' )
                  io.emit('enableTrackBut', 'Enabled' )
                  console.log('Has it called2?');
              // }catch(msg){
                  // console.log(msg);
              // }
          // }
          socket.to(roomId).emit('enableTrackBut', 'Enabled' )

      } else{ //joining from overview national
          console.log(userId);
          console.log('Admin');
          adminAvailableLightUp = true;
      }
      console.log('Socket id ', socket.id, 'Joined', roomId, ' on ', userId);
      // socket.broadcast.to(roomId).emit('user-joined', userId)
      
      // if(userId.user == 'admin'){
      //     console.log('Admin joined')
      //     adminAvailable = true
      //     if (driverAvailable){
      //         console.log('Driver is available');
      //         socket.broadcast.to(roomId).emit('readyLight', userId);
      //     }
      //     console.log('Broadcasting socket: ', socket.id);
      // }else{
      //     console.log('Driver joined...')
      //     console.log('Broadcasting socket: ', socket.id);
      //     driverAvailable = true;
      //     if (adminAvailable){
      //         console.log('Broadcasting socket (with admin): ', socket.id);
      //         socket.broadcast.to(roomId).emit('readyLight', userId);
      //         // socket.emit('readyLight', userId);
      //         io.to(socket.id).emit('readyLight', userId);
      //     }
      // }

      socket.on('ready', (cb)=>{
          console.log('Called ready with socket ', socket.id);
          console.log(`${socket.id} is in ${socket.rooms} room`)
          if(userId.user == 'admin'){
              adminAvailable = true
              console.log(`From admin ${userId}`);
              console.log('This is roomId in ready ', roomId);
              socket.broadcast.to(roomId).emit('user-joined', userId, roomId)
              // socket.to(roomId).emit('readyLight', userId);
              // adminSocketVar = socket;
          }else{
              console.log(`From Driver now... ${userId}`);
              cb('brown');
              // socket.broadcast.to(roomId).emit('user-joined', userId)
              // socket.to(roomId).emit('user-joined', userId)
              // if (adminAvailable){

              // adminSocketVar.broadcast.to(roomId).emit('user-joined', userId, roomId)
              // socket.broadcast.to(roomId).emit('user-joined', userId, roomId)
              io.to(roomId).emit('user-joined', userId, roomId);
                  // console.log('Admin is ', adminAvailable);
                  console.log('Number of clients joined: ', io.sockets.adapter.rooms.size);
                  let numOfClients = io.sockets.adapter.rooms.size;
                  socket.to(roomId).emit('readyLight', userId, roomId, io.sockets.adapter.rooms.size);
                  console.log(`Admin to ${socket.id}`);
                  // adminSocketVar.to(socket.id).emit('readyLight', userId);
                  // socket.to(socket.id).emit('readyLight', userId);
                  console.log(`Admin2 to ${socket.id}`);
                  // socket.to(roomId).emit('user-joined', userId)
              // }

          }
      });

      // socket. //join room Number
      
      socket.on('disconnect', ()=>{
          socket.broadcast.to(roomId).emit('user-disconnected', userId)
      })

  })
  // })(adminSocket)
  })


server.listen(process.env.PORT || 2000);
  
  
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true }); //play around with this
const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to mongoose now'));



let userRoute = require('./routes/user.js');
let assetRoute = require('./routes/asset.js');
let assetTypeRoute = require('./routes/assetType.js');
let contractorRoute = require('./routes/contractor.js');
let overviewRoute = require('./routes/overview.js');
let recentRoute = require('./routes/recent.js');
const passport = require('passport');
const flash = require ('express-flash');
const session = require ('express-session');
 let userCredModel = require('./models/userCred.js');
 const initializePassport = require('./passport-config');

 initializePassport(passport,   async(email)=>{
 let user = await userCredModel.find({email:email});
//  console.log(user);
 console.log([1,2,3,4]);
 return user[0];

},  async (id)=>{
   let user = await userCredModel.findById(id);
    console.log('User gotten by id:')
  //   console.log(user);
   console.log('----')
   return user;
 })

const bodyParser = require('body-parser');
const assetModel = require('./models/asset');



app.use(bodyParser.urlencoded({limit: '10mb', extended:false}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout');

app.use(layout);
app.use(methodOverride('_method'));
app.use(express.static('public'));




app.use('/recent', recentRoute);

app.use(flash());
app.use(session({
  secret:'secret',
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());



// app.use('/user', userRoute);

// var sega= [
  //   {datal:"I love you", model:'alphanumeric'},
  //   {datal: '200', model: "numeric"}
  // ]
  // var segaVar = JSON.stringify(sega);
  
  app.get('/', async (req, res)=>{
    console.log('This is the user');
    // res.send('Working too')
    
    
    // QRCode.toDataURL(segaVar, {type:'terminal'}, function(err, url){
      //   res.render('userform', {code:url, users:user});
    // })
    res.render('landingPage');//code:url,
    //, {msg:'error message goes in here'}
  });

  app.get('/dana/:userId/:assetId/:assetUuid', async (req, res)=>{
    // res.send('Working too')
    QRCode.toDataURL(`https://assetmanger.herokuapp.com/user/confirmArrival/${req.params.userId}/${req.params.assetId}/${req.params.assetUuid}`, {type:'terminal'}, function(err, url){
      console.log('This is the user2');
      console.log('This is userId, ', req.params.userId);
        res.render('userform', {code:url});
    })
    console.log('At the end...');
  });
  
  app.get('/login', checkNotAutheticated, (req, res)=>{
    res.render('userform2');
  })
  
  app.post('/login', checkNotAutheticated, passport.authenticate('local',{
    // successRedirect:'/user/new',
    successRedirect:'user/showOrNew',
    failureRedirect:'/login',
    failureFlash:true
  }));
  
  
  app.get('/register', checkNotAutheticated, (req, res)=>{
    res.render('register');
    // res.render('landingPage');//code:url,
  });
  
  app.post('/register', checkNotAutheticated, async (req, res)=>{
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new userCredModel({
        userName:req.body.name,
        email:req.body.email,
        password:hashedPassword
      });
      console.log(user);
      await user.save();
      res.redirect('/login');
    }catch (e){
      console.log(e.message)
      res.redirect('/register');
    }
  });

  
  app.get('/audit', (req,res)=>{
    console.log('Auditing...');
    console.log(req.user);
    console.log(req.user.userName);
    // res.redirect(`/audit/${uuidV4()}`)
    
    // if (req.params.genId){
      // }else{
        res.redirect(`/audGoLive/${uuidV4()}`);
        // }
    })
      

    app.get('/auditDone/:genId/:userId', (req,res)=>{
      console.log('auditDone');
      console.log(req.params.genId);
      res.redirect(`/audGoLive/${uuidV4()}/${req.params.genId}/${req.params.userId}`);
    })
      
    // app.get('/audit/:genId', (req,res)=>{
    //   res.redirect(`/audGoLive/${uuidV4()}/${genId}`);
    // });
      

app.get('/audit/:room', permitLists(), async (req,res)=>{
    // res.send('Getting room...');
    // res.render('audit/room', {roomId:req.params.room})
    // res.render('audit/index', {roomId:req.params.room});
    console.log('Auditing render...');
    console.log(req.query);
    // console.log(req.user);
    // console.log(req.user.userName);
    let userApprovalRoles = await userModel.find({}).where('approvalStatus').ne(null).distinct('approvalStatus');
                            // let userStoreApprovalRoles = await userModel.find({}).where('userStoreApproval').ne(null).distinct('approvalStatus');
                            let query = req.queryObj; //from permitLists middleware
                            console.log('Back here');
                            // console.log(query);
                            query = query.where('userOwnedAsset.id').ne(null); //users with Assets
                            // query.where(userOwnedAsset.id).equals
                            if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
                                query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
                            }
                            if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
                                query = query.lte('dateCreated', req.query.userDateBeforeSearch);
                            }
                            if (req.query.userApprovalRole != null && req.query.userApprovalRole != ""){
                                // req.query.userApprovalRole = (req.query.userApprovalRole == 'All')? null: req.query.userApprovalRole
                                if (req.query.userApprovalRole == 'All'){
                                    //Don't add to the query: Leave as is.
                                }else {
                                    query = query.where('approvalStatus').equals(req.query.userApprovalRole);
                                }

                            }
                            console.log('This is testing ',req.query.userDateBeforeSearch);
                            // console.log('This is testing ',req.query.userDateBeforeSearch.toString());
                            console.log(req.dispSetting);
                            let uiSettings = req.dispSetting;
                           
                           
                          console.log('userApprovalRoles: ', userApprovalRoles);
                          let userName = req.user.userName;
                          console.log('This is userName, ', userName);
                            try{
                                const users = await query.exec();

                                let idAuditObj = {};
                                users.forEach(user=>{
                                  for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                                    idAuditObj[user.id] = {userObj:[]}
                                  }
                                   
                                })



                                let dateObj;
                              //  let userToBeAudited = users.filter(user=>{
                              //     for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                              //       let diffTime = Date.now() - user.userOwnedAsset.idAudit[a].auditDate;
                              //       console.log('New Date object: ', new Date(diffTime));
                              //       dateObj = new Date(diffTime * 1000);
                              //       console.log('Query', req.query);
                              //       console.log('Before', req.query.userDateBeforeSearch);
                              //       console.log('New Date hours: ', new Date(diffTime).getHours());
                              //       console.log('New Date Date: ', new Date(diffTime).getDate());
                              //       console.log('Time lapse: ',typeof(user.userOwnedAsset.idAudit[a].auditDate));
                              //       console.log('Time lapse: ', Date.now() - user.userOwnedAsset.idAudit[a].auditDate);
                              //       console.log('Time lapse: ', req.query.userDateBeforeSearch - user.userOwnedAsset.idAudit[a].auditDate);
                                    
                              //       let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                              //         console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
                              //         console.log('Number of Days (rounded), ', Math.round(numOfDays));
                              //         // if ((req.query.userDays) == Math.ceil(numOfDays)){
                              //           user.userOwnedAsset.idAudit[a].firstName = user.firstName
                              //           user.userOwnedAsset.idAudit[a].userId = user.id
                              //           auditArr.push(user.userOwnedAsset.idAudit[a])
                              //           idAuditObj[user.id].push(user.userOwnedAsset.idAudit[a])
                              //         // }
                              //       //req.query.userDateBeforeSearch
                              //       // return (user.userOwnedAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                              //     }
                              //     // return user.userOwnedAsset.idAudit.forEach(assetObj=>{
                              //     //   console.log('Audit enter');
                              //     //   console.log('obj', assetObj);
                              //     //   console.log('in String', assetObj.id.toString());
                              //     //   return (assetObj.id.toString() == '63a1e335bc9dbf8077de0dc9');
                                    
                              //     // })
                              //   })

                              users.forEach(user=>{
                                for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                                  
                                  let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                  console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
                                  console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                  if (req.query.userDays){
                                    console.log('First...')
                                    if (Math.ceil(numOfDays) > (req.query.userDays) ||Math.ceil(numOfDays) == (req.query.userDays) ){
                                      // user.userOwnedAsset.idAudit[a].firstName = user.firstName
                                      // user.userOwnedAsset.idAudit[a].userId = user.id
                                      // auditArr.push(user.userOwnedAsset.idAudit[a])
                                      idAuditObj[user.id].firstName = user.firstName
                                      idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a])
                                    }

                                  }else {
                                    console.log('Second');
                                      // user.userOwnedAsset.idAudit[a].firstName = user.firstName
                                      // user.userOwnedAsset.idAudit[a].userId = user.id
                                      // auditArr.push(user.userOwnedAsset.idAudit[a])
                                      // idAuditObj[user.id].push(user.userOwnedAsset.idAudit[a])
                                      idAuditObj[user.id].firstName = user.firstName
                                      idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a])

                                  }
                                  // return (user.userOwnedAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                }
                                // return (auditArr);
                                // auditArr.push(user.userOwnedAsset.idAudit[a])

                               
                              })



                                console.log('This is userToBeAudited...', idAuditObj);
                                // const users = ['Adeiza', 'Yusuf'];
                                res.render('audit/index.ejs', {
                                    users:idAuditObj,
                                    searchParams:req.query,
                                    msg:'Auditing',
                                    msgClass:'noError',
                                    userName,
                                    roomId:req.params.room,
                                    userEmail:req.user.email,
                                    uiSettings,
                                    userApprovalRoles,
                                    dateObj
                                });                        
                            }catch(e) {
                              console.error(e);
                                console.log('An error occured');
                                res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                            }
})

app.get('/audGoLive/:room', hideNavMenu(), async (req, res)=>{
  console.log('This is assetDateBefore, audGoLive ', req.query.assetDateBeforeSearch);

  let auditArr = [];
  // console.log('req.query here: ', req.query);
  // console.log('Hitting...');
  // console.log(req.user);
  // console.log(req.query.userDateBeforeSearch);

  let userApprovalRoles = await userModel.find({}).where('approvalStatus').ne(null).distinct('approvalStatus');
  // let distinctAssets =  await assetTypeModel.find({}).distinct('assetTypeClass')
                let distinctAuditAssets;
                let distinctAssetManufacturer;
                let distinctAssetLifeCycle;
                let distinctStatus
                let distinctState;
                let distinctDirectorate;
                let distinctRank;
                let auditors;
                let auditorsStaff;
                let auditorsMap;

                try{
                  distinctAuditAssets =  await assetTypeAuditModel.find({}).populate('assetType');//.select('assetTypeClass assetTypeAuditInterval');
                  // distinctAssetManufacturer = await assetTypeAuditModel.find({}).populate('assetType').distinct('assetManufacturer');
                  distinctAssetManufacturer = await assetTypeModel.find({}).populate('assetType').distinct('assetTypeManufacturer');
                  distinctAssetLifeCycle = await assetTypeModel.find({}).populate('assetType').distinct('assetTypeLifeCycle');
                  distinctStatus = await assetTypeModel.find({}).populate('assetType').distinct('status');
                  auditors = await userCredModel.find({}).where('subRole').equals('auditor');//.populate('profileId');
                  
                 auditorsMap = auditors.map(auditor=>{
                    return auditor.profileId[0];
                  })
                  // console.log('Mapped auditors ', auditorsMap);
                  auditorsStaff = await userModel.find({}).where('_id').in(auditorsMap);//.select('firstName');

                  // auditorStaff =  await userModel.find({}).where()
                    // console.log('These are auditors: ', auditorStaff);
                  //userQueries
                  distinctState = await userModel.find({}).distinct('state');
                  distinctDirectorate = await userModel.find({}).distinct('directorate');
                  distinctRank = await userModel.find({}).distinct('rank');
                }catch(e){
              console.error(e)
                }

  // let distinctAuditAssets =  await assetTypeAuditModel.find({}).select('assetTypeClass assetTypeAuditInterval');
                            // let userStoreApprovalRoles = await userModel.find({}).where('userStoreApproval').ne(null).distinct('approvalStatus');
                            // let query = req.queryObj; //from permitLists middleware
                            let query = userModel.find().populate('userOwnedAsset.idAudit.assetTypeId userOwnedAsset.idAudit.id'); //from permitLists middleware
                            // console.log('Back here');
                            // console.log(query);
                            query = query.where('userOwnedAsset.id').ne(null); //users with Assets
                            // query.where(userOwnedAsset.id).equals
                            if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
                                query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
                            }
                            if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
                              console.log('Something here date');
                                query = query.lte('dateCreated', req.query.userDateBeforeSearch);
                            }

                            //userState
                            if (req.query.userState != null){// && req.query.userState != ""
                              if (req.query.userState == ""){
                                //skip from query
                                console.log('Skipped'); //return all
                              }else{
                                console.log('State')
                                query = query.regex('state', req.query.userState);
                              }
                            }
                            if (req.query.userDirectorate != null){// && req.query.userDirectorate != ""
                              console.log('Directorate')
                              if (req.query.userDirectorate == ""){
                                //skip from query
                                console.log('Skipped Directorate'); //return all directorates
                              }else{
                                query = query.regex('directorate', req.query.userDirectorate);
                              }
                            }
                            if (req.query.userRank != null){// && req.query.userRank != ""
                              if (req.query.userRank == ""){
                                console.log('This is rank (skip) ', req.query.userRank )
                                //skip from query
                              }else{
                                console.log('This is rank (skip)2 AudGoLive ', req.query.userRank )
                                query = query.regex('rank', req.query.userRank);
                              }
                            }
                            if (req.query.userApprovalRole != null && req.query.userApprovalRole != ""){
                              console.log('Approval')
                                // req.query.userApprovalRole = (req.query.userApprovalRole == 'All')? null: req.query.userApprovalRole
                                if (req.query.userApprovalRole == 'All'){
                                  console.log('What is this?')
                                    //Don't add to the query: Leave as is.
                                }else {
                                    console.log('What is this2?')
                                    query = query.where('approvalStatus').equals(req.query.userApprovalRole);
                                }

                            }

                            let uiSettings = req.dispSetting;
                            let userName = req.user.userName;
                            // console.log('This is userName, ', userName);
                            // console.log('These are assetTypes: ', distinctAuditAssets);
                            // console.log('These are distinctAssetManufacturer: ', distinctAssetManufacturer);

                            //Getting the first in profile of auditor
                            let auditor = await userModel.findById().where('_id').equals(req.user.profileId[0]);
                            let accessingAuditorId = auditor._id;


                              try{
                                  const users = await query.exec();

                                  // console.log('GeoCoord, ', users[0].geoCoord);
  
                                  let dateObj;
                                  // console.log('Today ',new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00'))
                                  let diffT = new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00')
                                  // console.log('Number of Hours', new Date(diffT).getHours());
                                
                                  let assetUniqueAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType');//.select('_id assetType audit');
                                  let uniqueAssetObj = {};
                                  // console.log('This is assetUniqueAuditObjArr, ', assetUniqueAuditObjArr);

                                  //assets - auditInterval mappings
                                    assetUniqueAuditObjArr.forEach(auditAssetType=>{
                                      uniqueAssetObj[auditAssetType.assetType._id.toString()] = auditAssetType.assetTypeAuditInterval;
                                      uniqueAssetObj[auditAssetType.assetType.assetTypeClass] = auditAssetType.assetTypeAuditInterval;
                                    })
                                    // console.log('This is uniqueAssetObj, ', uniqueAssetObj);

                                  //Now, we need to get into the for loop
                                  // console.log('This is users', users);
                                  let idAuditObj = {};
                                  users.forEach(user=>{
                                    for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){ //is this necessary
                                      idAuditObj[user.id] = {userObj:[]}
                                    }
                                  })

                                //  users.forEach(user=>{
                                //     for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                                //       // let diffTime = Date.now() - user.userOwnedAsset.idAudit[a].auditDate;
                                //       // let diffTime = new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate;
                                      
                                //       // console.log('New Date object: ', new Date(diffTime));
                                //       // dateObj = new Date(diffTime * 1000);
                                //       // console.log('Query', req.query);
                                //       // console.log('Before', req.query.userDateBeforeSearch);
                                //       // console.log('Before Object', new Date(req.query.userDateBeforeSearch));
                                //       // console.log('New Date hours: ', new Date(diffTime).getHours());
                                //       // console.log('New Date Date: ', new Date(diffTime).getDate());
                                //       // console.log('Time lapse: ',typeof(user.userOwnedAsset.idAudit[a].auditDate));
                                //       // console.log('Time lapse: ', new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // console.log('Time lapse: ', new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // let lapse = new Date(new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // let lapse2 = new Date(new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // console.log('This is lapse', lapse.getHours());
                                //       // console.log('This is lapse', lapse.getDay());
                                //       // console.log('This is lapse2', lapse2.getDay());
                                //       // console.log('Time lapse now: ', new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime());
                                //       // let numOfDays = (new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                //       let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                //       console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
                                //       console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                //       // console.log('First...')
                                //       if (req.query.assetDateBeforeSearch != ''){// assetDate
                                //           console.log('Something...');
                                //             if (user.userOwnedAsset.idAudit[a].auditDate.getTime() < (new Date(req.query.assetDateBeforeSearch).getTime())){
                                //               console.log('less than')
                                //               idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                //               idAuditObj[user.id].firstName = user.firstName;
                                //               idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                //             }

                                //       }else {
                                //         consol.log('Nothing...');
                                //           if (Math.ceil(numOfDays) > (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId]) || Math.ceil(numOfDays) == (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId])){
                                //             console.log('Greater')
                                //             idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                //             idAuditObj[user.id].firstName = user.firstName;
                                //             idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                //           }
                                //       }
                                //       // return (user.userOwnedAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                //     }
                                //     // return (auditArr);
                                //     // auditArr.push(user.userOwnedAsset.idAudit[a])

                                   
                                //   })
                              let filteredUser = []
                               users.forEach(user=>{
                                  for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                                    // console.log('The name, ', user.firstName);
                                    // let diffTime = Date.now() - user.userOwnedAsset.idAudit[a].auditDate;
                                    // let diffTime = new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate;
                                    
                                    // console.log('New Date object: ', new Date(diffTime));
                                    // dateObj = new Date(diffTime * 1000);
                                    // console.log('Query', req.query);
                                    // console.log('Before', req.query.userDateBeforeSearch);
                                    // console.log('Before Object', new Date(req.query.userDateBeforeSearch));
                                    // console.log('New Date hours: ', new Date(diffTime).getHours());
                                    // console.log('New Date Date: ', new Date(diffTime).getDate());
                                    // console.log('Time lapse: ',typeof(user.userOwnedAsset.idAudit[a].auditDate));
                                    // console.log('Time lapse: ', new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // console.log('Time lapse: ', new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // let lapse = new Date(new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // let lapse2 = new Date(new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // console.log('This is lapse', lapse.getHours());
                                    // console.log('This is lapse', lapse.getDay());
                                    // console.log('This is lapse2', lapse2.getDay());
                                    // console.log('Time lapse now: ', new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime());
                                    // let numOfDays = (new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                    let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                    // console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
                                    // console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                    // console.log('This is numOfDays ', numOfDays);
                                    // console.log('First...')
                                    if (req.query.assetDateBeforeSearch != ''){// assetDate   (Or asset settings?)
                                      // console.log('T', req.query.assetDateBeforeSearch)
                                        // console.log('Something...', user.userOwnedAsset.idAudit[a].id);
                                        if (user.userOwnedAsset.idAudit[a].assetTypeId){
                                          // console.log('Lifecycle, ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle);
                                          // console.log('id -', req.query.assetList);
                                          if (user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle){
                                            if (user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased){
                                              // console.log('Asset Purchased: ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime());
                                              // console.log('User length: ', users.length);
                                              // console.log('user.userOwnedAsset.idAudit.length, ', user.userOwnedAsset.idAudit.length);
                                              // console.log(user.userOwnedAsset.idAudit[a].assetTypeId.id.toString());
                                              // console.log('req.query.assetList: ', req.query.assetList);
                                              // console.log(user.userOwnedAsset.idAudit[a].assetTypeId.id.toString() == req.query.assetList);
                                              // console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle == (req.query.assetTypeLifeCycle?req.query.assetTypeLifeCycle:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle));
                                              // console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer == (req.query.assetManufacturer?req.query.assetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer));
                                              // console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime() < (new Date(req.query.assetDatePurchased).getTime()));
                                              
                                              // console.log('Time', new Date(user.userOwnedAsset.idAudit[a].auditDate.getTime()));
                                              // console.log('Time-2', req.query.assetDateBeforeSearch);

                                              // console.log('Time2', new Date(req.query.assetDateBeforeSearch).getTime());
                                              // console.log('Time Bool: ', user.userOwnedAsset.idAudit[a].auditDate.getTime() <= (new Date(req.query.assetDateBeforeSearch).getTime()));
                                              // console.log('req.query here2:', req.query);
                                          if (user.userOwnedAsset.idAudit[a].auditDate.getTime() <= (new Date(req.query.assetDateBeforeSearch).getTime()) && user.userOwnedAsset.idAudit[a].assetTypeId.id.toString() == req.query.assetList && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle == (req.query.assetTypeLifeCycle?req.query.assetTypeLifeCycle:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle)  && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer == (req.query.assetManufacturer?req.query.assetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer) && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime() < (new Date(req.query.assetDatePurchased).getTime())){//{
                                 
                                              // console.log('less than now2');
                                              // console.log('assetTypeid ', user.userOwnedAsset.idAudit[a].assetTypeId.id.toString());
                                              idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                              idAuditObj[user.id].firstName = user.firstName;
                                              idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                              idAuditObj[user.id].locationAudit = user.geoCoord;

                                              // console.log('Now', user.firstName, user.userOwnedAsset.idAudit[a].id)
                                              // return user;
                                              filteredUser.push(user)
                                          }
                                        }
                                        }
                                        }
                                          
                                        }else { //just go with the auditor admin settings auditIntervals
                                          console.log('Nothing...');
                                          console.log('Number of Days, ', numOfDays);
                                          console.log('uniqueAssetObj object', uniqueAssetObj);
                                          console.log('Before the id ', user.userOwnedAsset.idAudit[a]);
                                          console.log('The id: ', user.userOwnedAsset.idAudit[a].assetTypeId);
                                          console.log('Interval ', uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id]);
                                          if (Math.ceil(numOfDays) > (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id]) || Math.ceil(numOfDays) == (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id])){
                                            // console.log('Greater');
                                            idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                            idAuditObj[user.id].firstName = user.firstName;
                                            idAuditObj[user.id].locationAudit = user.geoCoord;
                                            idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                            // return user;
                                            filteredUser.push(user)
                                          }
                                        }
                                        // return (user.userOwnedAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                      }
                                      // return (auditArr);
                                      // auditArr.push(user.userOwnedAsset.idAudit[a])
                                      
                                    })
                                    console.log('idAudit Now', idAuditObj);
                                    
                              //       let idAuditAssetTypeObj = {};
                              //       let filteredUserAssetTypeClass = []
                              //       console.log('This is filteredUser, ', filteredUser);
                              //       if (filteredUser.length){

                              //         // filteredUser.forEach(user=>{
                              //         //   // for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                              //         //     idAuditObj[user.id].userObj = [];
                              //         //   // }
                              //         // })

                              //       filteredUser.forEach(user=>{
                              //         for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                              //           idAuditAssetTypeObj[user.id] = {userObj:[]}
                              //         }
                              //       })

                              //       console.log('idAuditAssetTypeObj template', idAuditAssetTypeObj);


                              //       filteredUser.forEach(user=>{
                              //         console.log('Once?')
                              //       user.userOwnedAsset.idAudit.forEach(userObj=>{
                              //           console.log('Just checking, ', userObj.assetTypeId);
                              //           if (userObj.assetTypeId){
                              //             if (userObj.assetTypeId.toString() == req.query.assetList){
                              //               console.log(userObj.assetTypeId.toString(),req.query.assetList);
                              //                     console.log('Matched Asset id', user.firstName, userObj.assetTypeId, userObj.id);
                              //                     console.log('Matched Asset assetTypeId', userObj.assetTypeId);
                              //                     // idAuditObj[user.id].userObj.push(userObj);
                              //               idAuditAssetTypeObj[user.id].userObj.push(userObj);
                              //               userObj.firstName = user.firstName;
                              //               console.log('', userObj);
                              //               filteredUserAssetTypeClass.push(user);
                              //         }
                              //       }
                                    
                              //     })
                              //   })
                              // }


                                  console.log('This is userToBeAudited...', auditArr);
                                  console.log('This is userToBeAudited2...', idAuditObj);
                                  
                                  //settings  //should this be here, or higher up?
                                      if(req.body.assetAuditInterval){ //if we are changing settings
                                        console.log('Correcting...');
                                        console.log(req.body);
                                        let assetAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType').where('_id').equals(req.body.assetId);
                                            assetAuditObjArr[0].assetTypeAuditInterval = req.body.assetAuditInterval;
                                            await assetAuditObjArr[0].save();
                                      }

                                      //Getting statistics
                                            let assets = await assetModel.find({}).where('auditTrail').ne(null).select('assetName auditTrail');

                                            console.log('Audited assets', assets.length);

                                            let assetArr = [];
                                            let assetObj = {
                                              functional:0,
                                              nonFunctional:0,
                                              retired:0
                                            }

                                            assets.forEach((asset,i)=>{
                                              if (asset.auditTrail.length){
                                                asset.auditTrail.forEach((auditObj,j)=>{
                                                  console.log('Status ',auditObj.auditStatus);
                                                  ++assetObj[auditObj.auditStatus];
                                                })
                                              }
                                            });

                                      console.log('This is assetObj', assetObj)

                                  let uiSettings = req.dispSetting;


                                  res.render('audit/index.ejs', {
                                      users:idAuditObj,
                                      searchParams:req.query,
                                      msg:'Auditing',
                                      msgClass:'noError',
                                      userName,
                                      accessingAuditorId,
                                      roomId:req.params.room,
                                      userEmail:req.user.email,
                                      uiSettings,
                                      userApprovalRoles,
                                      distinctAuditAssets,
                                      distinctAssetManufacturer,
                                      distinctAssetLifeCycle,
                                      dateObj,
                                      distinctState,
                                      distinctDirectorate,
                                      distinctRank,
                                      reqUser:req.user,
                                      assetObj: assetObj,
                                      reloadCheck:req.query.userState,
                                      auditors:auditorsStaff,
                                      genIdDone:null

                                      // auditors2:auditors
                                  });                        
                              }catch(e) {
                                console.error(e);
                                  console.log('An error occured2');
                                  res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                              }

});

app.get('/audGoLive/:room/:genId/:auditorId', async (req, res)=>{
  console.log('This is assetDateBefore, ', req.query.assetDateBeforeSearch);
  console.log('genId present or not: ', req.params.genId);

  let auditArr = [];
  console.log('req.query here: ', req.query);
  console.log('Hitting...');
  console.log(req.user);
  console.log(req.query.userDateBeforeSearch);



  let userApprovalRoles = await userModel.find({}).where('approvalStatus').ne(null).distinct('approvalStatus');
  // let distinctAssets =  await assetTypeModel.find({}).distinct('assetTypeClass')
                let distinctAuditAssets;
                let distinctAssetManufacturer;
                let distinctAssetLifeCycle;
                let distinctStatus
                let distinctState;
                let distinctDirectorate;
                let distinctRank;
                let auditors;
                let auditorsStaff;
                let auditorsMap;

                try{
                  distinctAuditAssets =  await assetTypeAuditModel.find({}).populate('assetType');//.select('assetTypeClass assetTypeAuditInterval');
                  // distinctAssetManufacturer = await assetTypeAuditModel.find({}).populate('assetType').distinct('assetManufacturer');
                  distinctAssetManufacturer = await assetTypeModel.find({}).populate('assetType').distinct('assetTypeManufacturer');
                  distinctAssetLifeCycle = await assetTypeModel.find({}).populate('assetType').distinct('assetTypeLifeCycle');
                  distinctStatus = await assetTypeModel.find({}).populate('assetType').distinct('status');
                  auditors = await userCredModel.find({}).where('subRole').equals('auditor');//.populate('profileId');
                  
                 auditorsMap = auditors.map(auditor=>{
                    return auditor.profileId[0];
                  })
                  console.log('Mapped auditors ', auditorsMap);
                  auditorsStaff = await userModel.find({}).where('_id').in(auditorsMap);//.select('firstName');

                  // auditorStaff =  await userModel.find({}).where()
                    // console.log('These are auditors: ', auditorStaff);
                  //userQueries
                  distinctState = await userModel.find({}).distinct('state');
                  distinctDirectorate = await userModel.find({}).distinct('directorate');
                  distinctRank = await userModel.find({}).distinct('rank');
                }catch(e){
              console.error(e)
                }

  // let distinctAuditAssets =  await assetTypeAuditModel.find({}).select('assetTypeClass assetTypeAuditInterval');
                            // let userStoreApprovalRoles = await userModel.find({}).where('userStoreApproval').ne(null).distinct('approvalStatus');
                            // let query = req.queryObj; //from permitLists middleware
                            let query = userModel.find().populate('userOwnedAsset.idAudit.assetTypeId userOwnedAsset.idAudit.id'); //from permitLists middleware
                            console.log('Back here');
                            // console.log(query);
                            query = query.where('userOwnedAsset.id').ne(null); //users with Assets
                            // query.where(userOwnedAsset.id).equals
                            if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
                                query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
                            }
                            if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
                                query = query.lte('dateCreated', req.query.userDateBeforeSearch);
                            }

                            //userState
                            if (req.query.userState != null){// && req.query.userState != ""
                              if (req.query.userState == ""){
                                //skip from query
                                console.log('Skipped'); //return all
                              }else{
                                console.log('State')
                                query = query.regex('state', req.query.userState);
                              }
                            }
                            if (req.query.userDirectorate != null){// && req.query.userDirectorate != ""
                              console.log('Directorate')
                              if (req.query.userDirectorate == ""){
                                //skip from query
                                console.log('Skipped Directorate'); //return all directorates
                              }else{
                                query = query.regex('directorate', req.query.userDirectorate);
                              }
                            }
                            if (req.query.userRank != null){// && req.query.userRank != ""
                              if (req.query.userRank == ""){
                                console.log('This is rank (skip) ', req.query.userRank )
                                //skip from query
                              }else{
                                console.log('This is rank (skip)2 many', req.query.userRank )
                                query = query.regex('rank', req.query.userRank);
                              }
                            }
                            if (req.query.userApprovalRole != null && req.query.userApprovalRole != ""){
                              console.log('Approval')
                                // req.query.userApprovalRole = (req.query.userApprovalRole == 'All')? null: req.query.userApprovalRole
                                if (req.query.userApprovalRole == 'All'){
                                  console.log('What is this?')
                                    //Don't add to the query: Leave as is.
                                }else {
                                    console.log('What is this2?')
                                    query = query.where('approvalStatus').equals(req.query.userApprovalRole);
                                }

                            }

                            let uiSettings = req.dispSetting;
                            let userName = req.user.userName;
                            console.log('This is userName, ', userName);
                            console.log('These are assetTypes: ', distinctAuditAssets);
                            console.log('These are distinctAssetManufacturer: ', distinctAssetManufacturer);
                              try{
                                  const users = await query.exec();

                                  console.log('GeoCoord, ', users[0].geoCoord);
  
                                  let dateObj;
                                  console.log('Today ',new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00'))
                                  let diffT = new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00')
                                  console.log('Number of Hours', new Date(diffT).getHours());
                                
                                  let assetUniqueAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType');//.select('_id assetType audit');
                                  let uniqueAssetObj = {};
                                  // console.log('This is assetUniqueAuditObjArr, ', assetUniqueAuditObjArr);

                                  //assets - auditInterval mappings
                                    assetUniqueAuditObjArr.forEach(auditAssetType=>{
                                      uniqueAssetObj[auditAssetType.assetType._id.toString()] = auditAssetType.assetTypeAuditInterval;
                                      uniqueAssetObj[auditAssetType.assetType.assetTypeClass] = auditAssetType.assetTypeAuditInterval;
                                    })
                                    console.log('This is uniqueAssetObj, ', uniqueAssetObj);

                                  //Now, we need to get into the for loop
                                  // console.log('This is users', users);
                                  let idAuditObj = {};
                                  users.forEach(user=>{
                                    for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){ //is this necessary
                                      idAuditObj[user.id] = {userObj:[]}
                                    }
                                  })

                                //  users.forEach(user=>{
                                //     for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                                //       // let diffTime = Date.now() - user.userOwnedAsset.idAudit[a].auditDate;
                                //       // let diffTime = new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate;
                                      
                                //       // console.log('New Date object: ', new Date(diffTime));
                                //       // dateObj = new Date(diffTime * 1000);
                                //       // console.log('Query', req.query);
                                //       // console.log('Before', req.query.userDateBeforeSearch);
                                //       // console.log('Before Object', new Date(req.query.userDateBeforeSearch));
                                //       // console.log('New Date hours: ', new Date(diffTime).getHours());
                                //       // console.log('New Date Date: ', new Date(diffTime).getDate());
                                //       // console.log('Time lapse: ',typeof(user.userOwnedAsset.idAudit[a].auditDate));
                                //       // console.log('Time lapse: ', new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // console.log('Time lapse: ', new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // let lapse = new Date(new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // let lapse2 = new Date(new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                //       // console.log('This is lapse', lapse.getHours());
                                //       // console.log('This is lapse', lapse.getDay());
                                //       // console.log('This is lapse2', lapse2.getDay());
                                //       // console.log('Time lapse now: ', new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime());
                                //       // let numOfDays = (new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                //       let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                //       console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
                                //       console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                //       // console.log('First...')
                                //       if (req.query.assetDateBeforeSearch != ''){// assetDate
                                //           console.log('Something...');
                                //             if (user.userOwnedAsset.idAudit[a].auditDate.getTime() < (new Date(req.query.assetDateBeforeSearch).getTime())){
                                //               console.log('less than')
                                //               idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                //               idAuditObj[user.id].firstName = user.firstName;
                                //               idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                //             }

                                //       }else {
                                //         consol.log('Nothing...');
                                //           if (Math.ceil(numOfDays) > (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId]) || Math.ceil(numOfDays) == (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId])){
                                //             console.log('Greater')
                                //             idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                //             idAuditObj[user.id].firstName = user.firstName;
                                //             idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                //           }
                                //       }
                                //       // return (user.userOwnedAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                //     }
                                //     // return (auditArr);
                                //     // auditArr.push(user.userOwnedAsset.idAudit[a])

                                   
                                //   })
                              let filteredUser = []
                               users.forEach(user=>{
                                  for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                                    console.log('The name, ', user.firstName);
                                    // let diffTime = Date.now() - user.userOwnedAsset.idAudit[a].auditDate;
                                    // let diffTime = new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate;
                                    
                                    // console.log('New Date object: ', new Date(diffTime));
                                    // dateObj = new Date(diffTime * 1000);
                                    // console.log('Query', req.query);
                                    // console.log('Before', req.query.userDateBeforeSearch);
                                    // console.log('Before Object', new Date(req.query.userDateBeforeSearch));
                                    // console.log('New Date hours: ', new Date(diffTime).getHours());
                                    // console.log('New Date Date: ', new Date(diffTime).getDate());
                                    // console.log('Time lapse: ',typeof(user.userOwnedAsset.idAudit[a].auditDate));
                                    // console.log('Time lapse: ', new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // console.log('Time lapse: ', new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // let lapse = new Date(new Date(req.query.userDateBeforeSearch) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // let lapse2 = new Date(new Date(Date.now()) - user.userOwnedAsset.idAudit[a].auditDate);
                                    // console.log('This is lapse', lapse.getHours());
                                    // console.log('This is lapse', lapse.getDay());
                                    // console.log('This is lapse2', lapse2.getDay());
                                    // console.log('Time lapse now: ', new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime());
                                    // let numOfDays = (new Date(req.query.userDateBeforeSearch).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                    let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                    console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
                                    console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                    console.log('This is numOfDays ', numOfDays);
                                    // console.log('First...')
                                    if (req.query.assetDateBeforeSearch != ''){// assetDate   (Or asset settings?)
                                        console.log('Something...', user.userOwnedAsset.idAudit[a].id);
                                        if (user.userOwnedAsset.idAudit[a].assetTypeId){
                                          console.log('Lifecycle, ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle);
                                          console.log('id -', req.query.assetList);
                                          if (user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle){
                                            if (user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased){
                                              console.log('Asset Purchased: ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime());
                                              console.log('User length: ', users.length);
                                              console.log('user.userOwnedAsset.idAudit.length, ', user.userOwnedAsset.idAudit.length);
                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.id.toString());
                                              console.log('req.query.assetList: ', req.query.assetList);
                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.id.toString() == req.query.assetList);
                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle == (req.query.assetTypeLifeCycle?req.query.assetTypeLifeCycle:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle));
                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer == (req.query.assetManufacturer?req.query.assetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer));
                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime() < (new Date(req.query.assetDatePurchased).getTime()));

                                          if (user.userOwnedAsset.idAudit[a].auditDate.getTime() <= (new Date(req.query.assetDateBeforeSearch).getTime()) && user.userOwnedAsset.idAudit[a].assetTypeId.id.toString() == req.query.assetList && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle == (req.query.assetTypeLifeCycle?req.query.assetTypeLifeCycle:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle)  && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer == (req.query.assetManufacturer?req.query.assetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer) && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime() < (new Date(req.query.assetDatePurchased).getTime())){//{
                                 
                                              console.log('less than now2');
                                              console.log('assetTypeid ', user.userOwnedAsset.idAudit[a].assetTypeId.id.toString());
                                              idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                              idAuditObj[user.id].firstName = user.firstName;
                                              idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                              idAuditObj[user.id].locationAudit = user.geoCoord;

                                              console.log('Now', user.firstName, user.userOwnedAsset.idAudit[a].id)
                                              // return user;
                                              filteredUser.push(user)
                                          }
                                        }
                                        }
                                        }
                                          
                                        }else { //just go with the auditor admin settings auditIntervals
                                          console.log('Nothing...');
                                          console.log('Number of Days, ', numOfDays);
                                          console.log('uniqueAssetObj object', uniqueAssetObj);
                                          console.log('Before the id ', user.userOwnedAsset.idAudit[a]);
                                          console.log('The id: ', user.userOwnedAsset.idAudit[a].assetTypeId);
                                          console.log('Interval ', uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id]);
                                          if (Math.ceil(numOfDays) > (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id]) || Math.ceil(numOfDays) == (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id])){
                                            console.log('Greater');
                                            idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                            idAuditObj[user.id].firstName = user.firstName;
                                            idAuditObj[user.id].locationAudit = user.geoCoord;
                                            idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                            // return user;
                                            filteredUser.push(user)
                                          }
                                        }
                                        // return (user.userOwnedAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                      }
                                      // return (auditArr);
                                      // auditArr.push(user.userOwnedAsset.idAudit[a])
                                      
                                    })
                                    console.log('idAudit Now', idAuditObj);
                                    
                              //       let idAuditAssetTypeObj = {};
                              //       let filteredUserAssetTypeClass = []
                              //       console.log('This is filteredUser, ', filteredUser);
                              //       if (filteredUser.length){

                              //         // filteredUser.forEach(user=>{
                              //         //   // for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                              //         //     idAuditObj[user.id].userObj = [];
                              //         //   // }
                              //         // })

                              //       filteredUser.forEach(user=>{
                              //         for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                              //           idAuditAssetTypeObj[user.id] = {userObj:[]}
                              //         }
                              //       })

                              //       console.log('idAuditAssetTypeObj template', idAuditAssetTypeObj);


                              //       filteredUser.forEach(user=>{
                              //         console.log('Once?')
                              //       user.userOwnedAsset.idAudit.forEach(userObj=>{
                              //           console.log('Just checking, ', userObj.assetTypeId);
                              //           if (userObj.assetTypeId){
                              //             if (userObj.assetTypeId.toString() == req.query.assetList){
                              //               console.log(userObj.assetTypeId.toString(),req.query.assetList);
                              //                     console.log('Matched Asset id', user.firstName, userObj.assetTypeId, userObj.id);
                              //                     console.log('Matched Asset assetTypeId', userObj.assetTypeId);
                              //                     // idAuditObj[user.id].userObj.push(userObj);
                              //               idAuditAssetTypeObj[user.id].userObj.push(userObj);
                              //               userObj.firstName = user.firstName;
                              //               console.log('', userObj);
                              //               filteredUserAssetTypeClass.push(user);
                              //         }
                              //       }
                                    
                              //     })
                              //   })
                              // }


                                  console.log('This is userToBeAudited...', auditArr);
                                  console.log('This is userToBeAudited2...', idAuditObj);
                                  
                                  //settings  //should this be here, or higher up?
                                      if(req.body.assetAuditInterval){ //if we are changing settings
                                        console.log('Correcting...');
                                        console.log(req.body);
                                        let assetAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType').where('_id').equals(req.body.assetId);
                                            assetAuditObjArr[0].assetTypeAuditInterval = req.body.assetAuditInterval;
                                            await assetAuditObjArr[0].save();
                                      }

                                      //Getting statistics
                                            let assets = await assetModel.find({}).where('auditTrail').ne(null).select('assetName auditTrail');

                                            console.log('Audited assets', assets.length);

                                            let assetArr = [];
                                            let assetObj = {
                                              functional:0,
                                              nonFunctional:0,
                                              retired:0
                                            }

                                            assets.forEach((asset,i)=>{
                                              if (asset.auditTrail.length){
                                                asset.auditTrail.forEach((auditObj,j)=>{
                                                  console.log('Status ',auditObj.auditStatus);
                                                  ++assetObj[auditObj.auditStatus];
                                                })
                                              }
                                            });
                                 console.log('This is assetObj', assetObj)

                                 console.log('This is genIdDone: ', req.params.genId);
                                 if (req.params.genId){
                                  // This has been implemented in auditStatus2

                                   let auditor = await userCredModel.findById(req.params.auditorId); //getting auditor login credentials
                                   console.log('Marking auditObj as Done');
                                   console.log('This is auditor ', auditor);
                                     let user = await userModel.findById(auditor.profileId[0]); //getting first -and only- user in profile of auditor
                                     console.log('This is user ', user);
                                     for (const auditAssignObj of user.userRole.auditAssigns){
                                       if (auditAssignObj.genId == req.params.genId){
                                         console.log('This is auditObj ', auditAssignObj);
                                         auditAssignObj.auditStatus.status = 'Done'
                                         auditAssignObj.auditStatus.date = new Date();
                                         let user2 = await user.save();
                                         console.log('Saving...');
                                       }
                                     }
                                 }
                                      
                                  res.render('audit/index.ejs', {
                                      users:idAuditObj,
                                      searchParams:req.query,
                                      msg:'Auditing',
                                      msgClass:'noError',
                                      userName,
                                      roomId:req.params.room,
                                      userEmail:req.user.email,
                                      uiSettings,
                                      userApprovalRoles,
                                      distinctAuditAssets,
                                      distinctAssetManufacturer,
                                      distinctAssetLifeCycle,
                                      dateObj,
                                      distinctState,
                                      distinctDirectorate,
                                      distinctRank,
                                      reqUser:req.user,
                                      assetObj: assetObj,
                                      reloadCheck:req.query.userState,
                                      auditors:auditorsStaff,
                                      genIdDone:req.params.genId
                                      // auditors2:auditors
                                  });                        
                              }catch(e) {
                                console.error(e);
                                  console.log('An error occured2');
                                  res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                              }

});

app.get('/auditsNow/:auditParam', async (req,res)=>{

  getAudit(req, res, false);

}) //end of getAudits

                async function getAudit(req, res, fromAuditStatus2){
                  let auditParamObj;
                  console.log('hitting... ', req.params.auditParam);
                  if (fromAuditStatus2){
                    auditParamObj = req.params.auditParam; 
                  }else{
                    auditParamObj = JSON.parse(req.params.auditParam);
                  }
                  console.log('As an object: ', auditParamObj);
                  console.log('This is assetDateBefore, ', req.query.assetDateBeforeSearch);
                
                  let auditArr = [];
                  console.log('req.query here: ', req.query);
                  console.log('Hitting...');
                  console.log(req.user);
                  console.log(req.query.userDateBeforeSearch);
                
                  let userApprovalRoles = await userModel.find({}).where('approvalStatus').ne(null).distinct('approvalStatus');
                  // let distinctAssets =  await assetTypeModel.find({}).distinct('assetTypeClass')
                                let distinctAuditAssets;
                                let distinctAssetManufacturer;
                                let distinctAssetLifeCycle;
                                let distinctStatus
                                let distinctState;
                                let distinctDirectorate;
                                let distinctRank;
                                let auditors;
                                let auditorsStaff;
                                let auditorsMap;
                
                                try{
                                  distinctAuditAssets =  await assetTypeAuditModel.find({}).populate('assetType');//.select('assetTypeClass assetTypeAuditInterval');
                                  // distinctAssetManufacturer = await assetTypeAuditModel.find({}).populate('assetType').distinct('assetManufacturer');
                                  distinctAssetManufacturer = await assetTypeModel.find({}).populate('assetType').distinct('assetTypeManufacturer');
                                  distinctAssetLifeCycle = await assetTypeModel.find({}).populate('assetType').distinct('assetTypeLifeCycle');
                                  distinctStatus = await assetTypeModel.find({}).populate('assetType').distinct('status');
                                  auditors = await userCredModel.find({}).where('subRole').equals('auditor');//.populate('profileId');
                                  
                                 auditorsMap = auditors.map(auditor=>{
                                    return auditor.profileId[0];
                                  })
                                  console.log('Mapped auditors ', auditorsMap);
                                  auditorsStaff = await userModel.find({}).where('_id').in(auditorsMap);//.select('firstName');
                
                                  // auditorStaff =  await userModel.find({}).where()
                                    // console.log('These are auditors: ', auditorStaff);
                                  //userQueries
                                  distinctState = await userModel.find({}).distinct('state');
                                  distinctDirectorate = await userModel.find({}).distinct('directorate');
                                  distinctRank = await userModel.find({}).distinct('rank');
                                }catch(e){
                              console.error(e)
                                }
                
                  // let distinctAuditAssets =  await assetTypeAuditModel.find({}).select('assetTypeClass assetTypeAuditInterval');
                                            // let userStoreApprovalRoles = await userModel.find({}).where('userStoreApproval').ne(null).distinct('approvalStatus');
                                            // let query = req.queryObj; //from permitLists middleware
                                            let query = userModel.find().populate('userOwnedAsset.idAudit.assetTypeId userOwnedAsset.idAudit.id'); //from permitLists middleware
                                            console.log('Back here');
                                            // console.log(query);
                                            query = query.where('userOwnedAsset.id').ne(null); //users with Assets
                                            // query.where(userOwnedAsset.id).equals
                                            if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
                                                query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
                                            }
                                            if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
                                                query = query.lte('dateCreated', req.query.userDateBeforeSearch);
                                            }
                
                                            //userState
                                            if (auditParamObj.userState != null){// && req.query.userState != ""
                                              if (auditParamObj.userState == ""){
                                                //skip from query
                                                console.log('Skipped'); //return all
                                              }else{
                                                console.log('State')
                                                query = query.regex('state', auditParamObj.userState);
                                              }
                                            }
                                            if (auditParamObj.userDirectorate != null){// && req.query.userDirectorate != ""
                                              console.log('Directorate')
                                              if (auditParamObj.userDirectorate == ""){
                                                //skip from query
                                                console.log('Skipped Directorate'); //return all directorates
                                              }else{
                                                query = query.regex('directorate', auditParamObj.userDirectorate);
                                              }
                                            }
                                            if (auditParamObj.userRank != null){// && req.query.userRank != ""
                                              if (auditParamObj.userRank == ""){
                                                console.log('This is rank (skip) ', auditParamObj.userRank )
                                                //skip from query
                                              }else{
                                                console.log('This is rank (skip)2 getAudit', auditParamObj.userRank )
                                                query = query.regex('rank', auditParamObj.userRank);
                                              }
                                            }
                                            if (auditParamObj.userApprovalRole != null && auditParamObj.userApprovalRole != ""){
                                              console.log('Approval')
                                                // auditParamObj.userApprovalRole = (auditParamObj.userApprovalRole == 'All')? null: auditParamObj.userApprovalRole
                                                if (auditParamObj.userApprovalRole == 'All'){
                                                  console.log('What is this?')
                                                    //Don't add to the query: Leave as is.
                                                }else {
                                                    console.log('What is this2?')
                                                    query = query.where('approvalStatus').equals(auditParamObj.userApprovalRole);
                                                }
                
                                            }
                
                                            let uiSettings = req.dispSetting;
                                            let userName = req.user.userName;
                                            console.log('This is userName, ', userName);
                                            console.log('These are assetTypes: ', distinctAuditAssets);
                                            console.log('These are distinctAssetManufacturer: ', distinctAssetManufacturer);
                                              try{
                                                  const users = await query.exec();
                
                                                  console.log('GeoCoord, ', users[0].geoCoord);
                  
                                                  let dateObj;
                                                  console.log('Today ',new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00'))
                                                  let diffT = new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00')
                                                  console.log('Number of Hours', new Date(diffT).getHours());
                                                
                                                  let assetUniqueAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType');//.select('_id assetType audit');
                                                  let uniqueAssetObj = {};
                                                  // console.log('This is assetUniqueAuditObjArr, ', assetUniqueAuditObjArr);
                
                                                  //assets - auditInterval mappings
                                                    assetUniqueAuditObjArr.forEach(auditAssetType=>{
                                                      uniqueAssetObj[auditAssetType.assetType._id.toString()] = auditAssetType.assetTypeAuditInterval;
                                                      uniqueAssetObj[auditAssetType.assetType.assetTypeClass] = auditAssetType.assetTypeAuditInterval;
                                                    })
                                                    console.log('This is uniqueAssetObj, ', uniqueAssetObj);
                
                                                  //Now, we need to get into the for loop
                                                  // console.log('This is users', users);
                                                  let idAuditObj = {};
                                                  users.forEach(user=>{
                                                    for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){ //is this necessary
                                                      idAuditObj[user.id] = {userObj:[]}
                                                    }
                                                  })
                
                                
                                              let filteredUser = []
                                               users.forEach(user=>{
                                                  for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
                                                    console.log('The name, ', user.firstName);
                
                                                    let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                                    console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
                                                    console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                                    console.log('This is numOfDays ', numOfDays);
                                                    // console.log('First...')
                                                    if (auditParamObj.assetDateBeforeSearch != ''){// assetDate //go with the auditor settings.  (Or asset settings?)
                                                        console.log('Something... auditParams', user.userOwnedAsset.idAudit[a].id);
                                                        if (user.userOwnedAsset.idAudit[a].assetTypeId){
                                                          console.log('Lifecycle, ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle);
                                                          console.log('id -', auditParamObj.assetList);
                                                          if (user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle){
                                                            if (user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased){
                                                              console.log('Asset Purchased: ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime());
                                                              console.log('User length: ', users.length);
                                                              console.log('user.userOwnedAsset.idAudit.length, ', user.userOwnedAsset.idAudit.length);
                                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.id.toString());
                                                              console.log('auditParamObj.assetList: ', auditParamObj.assetList);
                                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.id.toString() == auditParamObj.assetList);
                                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle == (auditParamObj.assetTypeLifeCycle?auditParamObj.assetTypeLifeCycle:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle));
                                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer == (auditParamObj.assetManufacturer?auditParamObj.assetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer));
                                                              console.log(user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime() < (new Date(auditParamObj.assetDatePurchased).getTime()));
                                                              console.log('TimeBool auditParams: ', user.userOwnedAsset.idAudit[a].auditDate.getTime() <= (new Date(auditParamObj.assetDateBeforeSearch).getTime()))
                                                              console.log('tim2', new Date(auditParamObj.assetDateBeforeSearch));
                                                              console.log('AssetList ', user.userOwnedAsset.idAudit[a].assetTypeId.id.toString() == auditParamObj.assetList);
                                                              console.log('confirm assetlist: ', user.userOwnedAsset.idAudit[a].assetTypeId.id.toString())
                                                              console.log('confirm assetListSent: ', auditParamObj.assetList);
                                                              console.log('Lifecycle: ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle == (auditParamObj.assetTypeLifeCycle?auditParamObj.assetTypeLifeCycle:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle))
                                                              console.log('Manu: ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer == (auditParamObj.assetManufacturer?auditParamObj.assetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer))
                                                              console.log('Confirm Manu: ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer);
                                                              console.log('Confirm Manu sent: ', auditParamObj.userAssetManufacturer?auditParamObj.userAssetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer)
                                                              // console.log('Confirm Manu sent: ', auditParamObj.assetManufacturer?auditParamObj.assetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetManufacturer) )
                                                              // console.log('Confirm Manu sent: ', )
                                                              console.log('Type: ', user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime() < (new Date(auditParamObj.assetDatePurchased).getTime()))
                                                          if (user.userOwnedAsset.idAudit[a].auditDate.getTime() <= (new Date(auditParamObj.assetDateBeforeSearch).getTime()) && user.userOwnedAsset.idAudit[a].assetTypeId.id.toString() == auditParamObj.assetList && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle == (auditParamObj.assetTypeLifeCycle?auditParamObj.assetTypeLifeCycle:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeLifeCycle)  && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer == (auditParamObj.userAssetManufacturer?auditParamObj.userAssetManufacturer:user.userOwnedAsset.idAudit[a].assetTypeId.assetTypeManufacturer) && user.userOwnedAsset.idAudit[a].assetTypeId.assetTypePurchased.getTime() < (new Date(auditParamObj.assetDatePurchased).getTime())){
                                                 
                                                              console.log('less than now2');
                                                              console.log('assetTypeid ', user.userOwnedAsset.idAudit[a].assetTypeId.id.toString());
                                                              idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                                              idAuditObj[user.id].firstName = user.firstName;
                                                              idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                                              idAuditObj[user.id].locationAudit = user.geoCoord;
                
                                                              console.log('Now', user.firstName, user.userOwnedAsset.idAudit[a].id)
                                                              // return user;
                                                              filteredUser.push(user)
                                                          }
                                                        }
                                                        }
                                                        }
                                                          
                                                        }else { //just go with the auditor admin settings auditIntervals
                                                          console.log('Nothing...');
                                                          console.log('Number of Days, ', numOfDays);
                                                          console.log('uniqueAssetObj object', uniqueAssetObj);
                                                          console.log('Before the id ', user.userOwnedAsset.idAudit[a]);
                                                          console.log('The id: ', user.userOwnedAsset.idAudit[a].assetTypeId);
                                                          console.log('Interval ', uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id]);
                                                          if (Math.ceil(numOfDays) > (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id]) || Math.ceil(numOfDays) == (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId._id])){
                                                            console.log('Greater');
                                                            idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                                            idAuditObj[user.id].firstName = user.firstName;
                                                            idAuditObj[user.id].locationAudit = user.geoCoord;
                                                            idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
                                                            // return user;
                                                            filteredUser.push(user)
                                                          }
                                                        }
                                                        // return (user.userOwnedAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                                      }
                                                      // return (auditArr);
                                                      // auditArr.push(user.userOwnedAsset.idAudit[a])
                                                      
                                                    })
                                                    console.log('idAudit Now', idAuditObj);
                                                  
                
                                                  console.log('This is userToBeAudited...', auditArr);
                                                  console.log('This is userToBeAudited2...', idAuditObj);
                                                  
                                                  //settings  //should this be here, or higher up?
                                                      if(req.body.assetAuditInterval){ //if we are changing settings
                                                        console.log('Correcting...');
                                                        console.log(req.body);
                                                        let assetAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType').where('_id').equals(req.body.assetId);
                                                            assetAuditObjArr[0].assetTypeAuditInterval = req.body.assetAuditInterval;
                                                            await assetAuditObjArr[0].save();
                                                      }
                
                                                      //Getting statistics
                                                            let assets = await assetModel.find({}).where('auditTrail').ne(null).select('assetName auditTrail');
                
                                                            console.log('Audited assets', assets.length);
                
                                                            let assetArr = [];
                                                            let assetObj = {
                                                              functional:0,
                                                              nonFunctional:0,
                                                              retired:0
                                                            }
                
                                                            assets.forEach((asset,i)=>{
                                                              if (asset.auditTrail.length){
                                                                asset.auditTrail.forEach((auditObj,j)=>{
                                                                  console.log('Status ',auditObj.auditStatus);
                                                                  ++assetObj[auditObj.auditStatus];
                                                                })
                                                              }
                                                            });
                
                                                      console.log('This is assetObj', assetObj)
                                                  // res.json({msg:idAuditObj});
                                                  console.log('As an object again: ', auditParamObj);
                                              if (fromAuditStatus2){
                                                console.log('fromAuditStatus2: ', fromAuditStatus2)
                                                return {
                                                  users:idAuditObj,
                                                  searchParams:auditParamObj,
                                                  msg:'Auditing',
                                                  msgClass:'noError',
                                                  userName,
                                                  roomId:req.params.room,
                                                  userEmail:req.user.email,
                                                  uiSettings,
                                                  userApprovalRoles,
                                                  distinctAuditAssets,
                                                  distinctAssetManufacturer,
                                                  distinctAssetLifeCycle,
                                                  dateObj,
                                                  distinctState,
                                                  distinctDirectorate,
                                                  distinctRank,
                                                  reqUser:req.user,
                                                  assetObj: assetObj,
                                                  reloadCheck:auditParamObj.userState,
                                                  auditors:auditorsStaff,
                                                  // auditors2:auditors
                                              }; //return this to auditStatus2
                                              }else{
                                                console.log('fromAuditStatus2: ', fromAuditStatus2)
                                                console.log('submit2')
                                                res.json(idAuditObj); //send this to index.ejs of audit

                                              }
                                                  // res.render('audit/index.ejs', {
                                                  //     users:idAuditObj,
                                                  //     searchParams:auditParamObj,
                                                  //     msg:'Auditing',
                                                  //     msgClass:'noError',
                                                  //     userName,
                                                  //     roomId:req.params.room,
                                                  //     userEmail:req.user.email,
                                                  //     uiSettings,
                                                  //     userApprovalRoles,
                                                  //     distinctAuditAssets,
                                                  //     distinctAssetManufacturer,
                                                  //     distinctAssetLifeCycle,
                                                  //     dateObj,
                                                  //     distinctState,
                                                  //     distinctDirectorate,
                                                  //     distinctRank,
                                                  //     reqUser:req.user,
                                                  //     assetObj: assetObj,
                                                  //     reloadCheck:auditParamObj.userState,
                                                  //     auditors:auditorsStaff,
                                                  //     // auditors2:auditors
                                                  // });                        
                                              }catch(e) {
                                                console.error(e);
                                                  console.log('An error occured2');
                                                  res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                                              }
                }

app.get('/auditSettingsCorrect/:data', async (req, res)=>{
  console.log('In auditSettingsCorrect');
  // let distinctAuditAssets;
  let auditArr = [];
  console.log(req.params);
  let data = JSON.parse(req.params.data);
  console.log(data);
  // console.log(JSON.stringify(req.body));
  // console.log(req.body.assetId);
  // console.log(req.body.assetAuditInterval);
  console.log('Hitting...');
          //updating audit settings
                let assetAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType').where('assetType').equals(data.assetId);
                console.log(assetAuditObjArr);
                  assetAuditObjArr[0].assetTypeAuditInterval = data.assetAuditInterval;
                  await assetAuditObjArr[0].save();
                  // }
                  try{
                    distinctAuditAssets =  await assetTypeAuditModel.find({}).populate('assetType');//.select('assetTypeClass assetTypeAuditInterval');
                    
                  }catch(e){
                    console.error(e)
                  }
                  console.log('These are assetTypes: ', distinctAuditAssets);
                  res.json({msg:'Done'});
                            
});

app.get('/getAuditSettings', async (req, res)=>{
  console.log('Getting auditSettings');
  // let distinctAuditAssets;
  let auditArr = [];          
                  // }
                  try{
                    distinctAuditAssets =  await assetTypeAuditModel.find({}).populate('assetType');//.select('assetTypeClass assetTypeAuditInterval');
                    
                  }catch(e){
                    console.error(e)
                  }
                  console.log('These are assetTypes: ', distinctAuditAssets);
                  res.json(distinctAuditAssets);
                            
});

// app.put('/auditSettingsCorrect', async (req, res)=>{
//   console.log('In auditSettingsCorrect');
//   let distinctAuditAssets;
//   let auditArr = [];
//   console.log(req.query);
//   console.log('Hitting...');
//   console.log(req.query.userDateBeforeSearch);

//   let userApprovalRoles = await userModel.find({}).where('approvalStatus').ne(null).distinct('approvalStatus');
//   let query = userModel.find(); //from permitLists middleware
//   console.log('Back here');
//   // console.log(query);
//   query = query.where('userOwnedAsset.id').ne(null); //users with Assets
//   // query.where(userOwnedAsset.id).equals
//   if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
//     query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
//   }
//   if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
//     query = query.lte('dateCreated', req.query.userDateBeforeSearch);
//                             }
//                             if (req.query.userApprovalRole != null && req.query.userApprovalRole != ""){
//                                 // req.query.userApprovalRole = (req.query.userApprovalRole == 'All')? null: req.query.userApprovalRole
//                                 if (req.query.userApprovalRole == 'All'){
//                                   //Don't add to the query: Leave as is.
//                                 }else {
//                                   query = query.where('approvalStatus').equals(req.query.userApprovalRole);
//                                 }
                                
//                               }
                              
//                               let uiSettings = req.dispSetting;
//                               let userName = req.user.userName;
//                               console.log('This is userName, ', userName);
                              
//                               //updating audit settings
//                                 let assetAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType').where('_id').equals(req.body.assetId);
//                                   assetAuditObjArr[0].assetTypeAuditInterval = req.body.assetAuditInterval;
//                                   await assetAuditObjArr[0].save();
//                                   // }
//                                   try{
//                                     distinctAuditAssets =  await assetTypeAuditModel.find({}).populate('assetType');//.select('assetTypeClass assetTypeAuditInterval');
                                    
//                                   }catch(e){
//                                     console.error(e)
//                                   }
//                                   console.log('These are assetTypes: ', distinctAuditAssets);


//                               try{
//                                 const users = await query.exec();
                                
//                                 let dateObj;
//                                 console.log('Today ',new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00'))
//                                 let diffT = new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00')
//                                 console.log('Number of Hours', new Date(diffT).getHours());
                                
//                                 let assetUniqueAuditObjArr = await assetTypeAuditModel.find({}).populate('assetType');//.select('_id assetType audit');
//                                 let uniqueAssetObj = {};
//                                 console.log('This is assetUniqueAuditObjArr, ', assetUniqueAuditObjArr);

//                                   assetUniqueAuditObjArr.forEach(auditAssetType=>{
//                                     uniqueAssetObj[auditAssetType.assetType._id.toString()] = auditAssetType.assetTypeAuditInterval;
//                                     uniqueAssetObj[auditAssetType.assetType.assetTypeClass] = auditAssetType.assetTypeAuditInterval;
//                                   })
//                                   console.log('This is uniqueAssetObj, ', uniqueAssetObj);

//                                 //Now, we need to get into the for loop
//                                 console.log('This is users', users);
//                                 let idAuditObj = {};
//                                 users.forEach(user=>{
//                                   for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
//                                     idAuditObj[user.id] = {userObj:[]}
//                                   }
//                                 })
                                
//                                 users.forEach(user=>{
//                                   for (var a=0;a<user.userOwnedAsset.idAudit.length;a++){
//                                     let numOfDays = (new Date(Date.now()).getTime() - user.userOwnedAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
//                                     console.log('Asset ', user.userOwnedAsset.idAudit[a].id);
//                                     console.log('Number of Days (rounded), ', Math.round(numOfDays));
//                                     if ( Math.ceil(numOfDays) > (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId]) || Math.ceil(numOfDays) == (uniqueAssetObj[user.userOwnedAsset.idAudit[a].assetTypeId])){
//                                       console.log('Greater')
//                                       idAuditObj[user.id].userProfilePic = user.userProfilePic;
//                                       idAuditObj[user.id].firstName = user.firstName;
//                                       idAuditObj[user.id].userObj.push(user.userOwnedAsset.idAudit[a]);
//                                     }
//                                   }
                                  
                                  
//                                 })
//                                 console.log('This is userToBeAudited...', auditArr);
//                                 console.log('This is userToBeAudited2...', idAuditObj);
//                                 // const users = ['Adeiza', 'Yusuf'];
//                                 //settings
//                                 // if(req.body.assetAuditInterval){ //if we are changing settings
//                                 console.log('Correcting...');
//                                 console.log(req.body);
                                
      
                                
//                                 res.render('audit/index.ejs', {
//                                   users:idAuditObj,
//                                   searchParams:req.query,
//                                   msg:'Auditing',
//                                   msgClass:'noError',
//                                   userName,
//                                       roomId:req.params.room,
//                                       userEmail:req.user.email,
//                                       uiSettings,
//                                       userApprovalRoles,
//                                       distinctAuditAssets,
//                                       dateObj
//                                   });                        
//                               }catch(e) {
//                                 console.error(e);
//                                   console.log('An error occured');
//                                   res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
//                               }

// })

app.put('/auditStatus', async (req, res)=>{
  console.log(req.body);
  let asset =  await assetModel.find({}).where('_id').equals(req.body.assetId).select('assetCode assetType assetName auditTrail');
  console.log('This is asset,', asset);
  asset[0].auditTrail.push(
    {
      user:req.body.userId,
      auditedBy:req.body.auditorId,
      auditStatus:req.body.auditStatus
    }
  );

  let asset2 = await asset[0].save();

  //it should also update the new audit date on the user 
  // let user =  await userModel.findById({}).where('_id').equals(req.body.userId);
  // console.log('This is user ', user)
  // user.userOwnedAsset.idAudit.forEach(auditObj=>{
  //   if (auditObj.id.toString() == req.body.assetId){
  //     console.log('Found');
  //     console.log(auditObj.auditDate)
  //     console.log(new Date(Date.now()));
  //     auditObj.auditDate = Date.now();
  //   }
  // })

  // await user.save();
 
  // console.log(asset2);
})

app.get('/auditStatus2/:auditUpdateObj', async (req, res)=>{
  console.log('auditUpdateObj is ', req.params.auditUpdateObj);
  let auditUpdateObjParse = JSON.parse(req.params.auditUpdateObj);


  //push to audit trail
  let asset =  await assetModel.find({}).where('_id').equals(auditUpdateObjParse.assetId).select('assetCode assetType assetName auditTrail');
  console.log('This is asset,', asset);

  // auditUpdateObjParse.auditResult.assetPasses = {one:'two', three:'four'}
  asset[0].auditTrail.push(
    {
      user:auditUpdateObjParse.userId,
      auditedBy:auditUpdateObjParse.auditorId,
      auditStatus:auditUpdateObjParse.auditResult.assetStatus,
      auditPasses:auditUpdateObjParse.auditResult.assetPasses,
      auditer:'luka',
      auditPasses2:{age:21},
      genId:auditUpdateObjParse.genId
    }
  );

  let asset2 = await asset[0].save();

  //it should also update the new audit date on the user 

  // i don't know about this
  let user =  await userModel.findById({}).where('_id').equals(auditUpdateObjParse.userId);
  console.log('This is user ', user)
  user.userOwnedAsset.idAudit.forEach(auditObj=>{
    if (auditObj.id.toString() == auditUpdateObjParse.assetId){
      console.log('Found');
      console.log(auditObj.auditDate)
      console.log(new Date(Date.now()));
      auditObj.auditDate = Date.now();
    }
  })
  //i don't know about this

  await user.save();

  
  
  //now check if postObj is satisfied, or if it remains
    //if remains, do nothing,
    //if satisfied, remove it from auditor assigns

    console.log('genId ', auditUpdateObjParse.genId);
    console.log('postObj ', auditUpdateObjParse.postObj);

    req.params.auditParam = auditUpdateObjParse.postObj;
    let remainingAudits = await getAudit(req, res, true); //the true means it is from auditStatus2
    console.log('Thi is remainingAudits: ', remainingAudits);

    console.log('Rendering...');

  
    let auditor = await userCredModel.findById(auditUpdateObjParse.auditorId); //getting auditor login credentials
  
  let userAuditor = await userModel.findById(auditor.profileId[0]); //getting first -and only- user in profile of auditor
  
  //update userRole.auditAssigns
  console.log('This is auditor ', userAuditor);
  // console.log('This is auditor pr ', userAuditor);
 for (const objToBeAudited of userAuditor.userRole.auditAssigns) {
    console.log('Entered 1');
    if (auditUpdateObjParse.genId == objToBeAudited.genId ){
      for (auditItem of objToBeAudited.auditProgress){
        if (auditItem.assetId == auditUpdateObjParse.assetId){
          auditItem.status = 'Done';
          let newUserAuditor = await userAuditor.save();
          console.log(newUserAuditor.userRole.auditAssigns[3].auditProgress[0])
        }
      }
      // console.log('Entered 2');
      // console.log(objToBeAudited);
      // console.log('userId auditUpdateObjParse:', auditUpdateObjParse.userId);
      // console.log('userId auditUpdateObjParse type:', typeof (auditUpdateObjParse.userId));
      // console.log('Progress: ', objToBeAudited.auditProgress);
      // console.log('Progress Specific: ', objToBeAudited.auditProgress['64a512dff9c53a0b4760e9ce']);
      // console.log('Progress auditUpdateObjParse: ', objToBeAudited.auditProgress[auditUpdateObjParse.userId]);
      // console.log(objToBeAudited.auditProgress[auditUpdateObjParse.userId]);
     
      // objToBeAudited.auditProgress[auditUpdateObjParse.userId][auditUpdateObjParse.assetId] = {auditStatus: 'Done'};
      // console.log(objToBeAudited.auditProgress[auditUpdateObjParse.userId][auditUpdateObjParse.assetId].auditStatus)
      // userAuditor.markModified('userRole.auditAssigns.auditProgress[auditUpdateObjParse.userId][auditUpdateObjParse.assetId]');
      // await objToBeAudited.save();
      // console.log('objToBeAudited after save, ', objToBeAudited);
      // console.log('Returned userAuditor, ', newUserAuditor.userRole.auditAssigns[3].auditProgress['64a512dff9c53a0b4760e9ce']['64a51524f9c53a0b4760eef4'])
    }
  } 


    console.log('auditUpdateObjParse.genId is: ', auditUpdateObjParse.genId);
    // res.render('audit/index.ejs',remainingAudits); 
  console.log('auditUpdateObj is ', req.params.auditUpdateObj);
    console.log('Done now2');

    let userWithAuditAssets = Object.keys(remainingAudits.users);
    console.log('This is keys, ', userWithAuditAssets);
      for (const user of userWithAuditAssets){
        console.log('This na user, ', user);
          if (remainingAudits.users[user].userObj.length == 0){
            console.log('Equals 0...');
            //remove from list ...
            if (auditUpdateObjParse.genId){
              console.log('There is gen...')
              let auditor = await userCredModel.findById(auditUpdateObjParse.auditorId); //getting auditor login credentials
              console.log('Marking auditObj as Done2');
              console.log('This is auditor2 ', auditor);
                let user = await userModel.findById(auditor.profileId[0]); //getting first -and only- user in profile of auditor
                console.log('This is user2 ', user);
                for (const auditAssignObj of user.userRole.auditAssigns){
                  if (auditAssignObj.genId == auditUpdateObjParse.genId){
                    console.log('This is auditObj2 to be marked as done ', auditAssignObj);
                    auditAssignObj.auditStatus.status = 'Done'
                    auditAssignObj.auditStatus.date = new Date();
                    let user2 = await user.save();
                    console.log('Saving...');
                  }
                }
            }                            
          }
    }


    // {
    //                                                   users:idAuditObj,
    //                                                   searchParams:auditParamObj,
    //                                                   msg:'Auditing',
    //                                                   msgClass:'noError',
    //                                                   userName,
    //                                                   roomId:req.params.room,
    //                                                   userEmail:req.user.email,
    //                                                   uiSettings,
    //                                                   userApprovalRoles,
    //                                                   distinctAuditAssets,
    //                                                   distinctAssetManufacturer,
    //                                                   distinctAssetLifeCycle,
    //                                                   dateObj,
    //                                                   distinctState,
    //                                                   distinctDirectorate,
    //                                                   distinctRank,
    //                                                   reqUser:req.user,
    //                                                   assetObj: assetObj,
    //                                                   reloadCheck:auditParamObj.userState,
    //                                                   auditors:auditorsStaff,
    //                                                   // auditors2:auditors
    //                                               });

  res.json({updatedAsset:asset2});
 
  // console.log(asset2);
})



app.get('/auditTrail/:id', async (req, res)=>{
  console.log('Auditing records...')
  console.log(req.params.id);
  try{
    let assetToAuditTrail = await assetModel.find({_id:req.params.id}).populate('auditTrail.auditedBy')
    res.send(assetToAuditTrail);
  }catch(e){
    console.log(e)
  }
})

app.get('/auditTrail2/:id', async (req, res)=>{
    console.log('Landed here')
    let directorate = [];
    let rank = [];
    let assetList = [];
    let assetListId = [];
    let assetListNamesAudit = [];
    let assetListIdAudit = [];
    let assetManufacturer = [];

    let objOptions ={directorate:[], rank:[], assetList:[], assetListId:[], assetListNamesAudit:[], assetListIdAudit:[], assetManufacturer:[]};
    console.log('This is id: ', req.params.id);
    var queryObj = JSON.parse(req.params.id);
    console.log('This is obj form: ', queryObj)
    // console.log(queryObj.auditField);
    // console.log(queryObj.auditValue);
    let query =  userModel.find();

    //these must not include any queries regarding fields not directly on the user document -nested documents.
    queryObj.auditField.forEach((audit, i)=>{
      if (queryObj.auditValue[i] == ""){
        query = query.where(audit).ne(queryObj.auditValue[i]);
      }else {
        query = query.where(audit).equals(queryObj.auditValue[i]);
      }
      // query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
    })

    // let auditQueryOptions = await query.populate('userOwnedAsset.id.assetType').exec();//userOwnedAsset.id is an asset //userOwnedAsset.id.assetType
    // let auditQueryOptions = await query.populate({path:'userOwnedAsset.id', model:assetModel, populate:{path:'assetType', model:assetTypeModel}}).exec();//userOwnedAsset.id is an asset //userOwnedAsset.id.assetType
    let auditQueryOptions = await query.populate({path:'userOwnedAsset.id', model:assetModel, populate:{path:'assetType', model:assetTypeModel}}).populate({path:'userOwnedAsset.idAudit.assetTypeId', model:assetTypeModel}).exec();//userOwnedAsset.id is an asset //userOwnedAsset.id.assetType

    console.log('auditQueryOptions');
    console.log(auditQueryOptions);
    
    // let auditQueryOptions = await userModel.find({}).where(queryObj.auditField).equals(queryObj.auditValue);//populate('auditTrail.auditedBy')
    auditQueryOptions.forEach(user=>{
      // objOptions.directorate.push(user.directorate);
      directorate.push(user.directorate);
      // objOptions.rank.push(user.rank);
      rank.push(user.rank);
      assetList.push(...user.userOwnedAsset.idType);
      assetListId.push(...user.userOwnedAsset.id);
      
      
      //supposed to push idAudit
      assetListIdAudit.push(...user.userOwnedAsset.idAudit);
      assetListNamesAudit.push(...user.userOwnedAsset.idAudit);
      // assetListNamesAudit

      // assetManufacturer.push(...user.userOwnedAsset.id);
      assetManufacturerMap = user.userOwnedAsset.id.map(asset=>{
        // if (asset.assetTypeManufacturer){
          // console.log('assetTypes -', asset.assetType);
          console.log('userOwnedAsset ', asset);
          return ((asset.assetType.assetTypeManufacturer)?asset.assetType.assetTypeManufacturer:'No Manufacturer');
        // }
      });
      assetManufacturer.push(...assetManufacturerMap);
    })

    console.log('Directorate: ', directorate)
    console.log('Rank: ', rank);
    console.log('Manufacturer: ', assetManufacturer);
    console.log('AssetListId: ', assetListId);
    console.log('AssetListIdAudit', assetListIdAudit);
    console.log('AssetListNamesAudit', assetListNamesAudit);

    // making values unique
    var a = ['a', 1, 'a', 2, '1'];
    var directorateUnique = directorate.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    var rankUnique = rank.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    var assetListUnique = assetList.filter(function (value, index, self) {
      return self.indexOf(value) === index;
    });

    // assetListIdAudit
    let assetListIdAuditMap = assetListIdAudit.map(asset=>{
      // return asset.assetType._id.toString();
      return asset.assetTypeId._id.toString();
    })
    var assetListIdAuditUnique = assetListIdAuditMap.filter(function (value, index, self) {
      return self.indexOf(value) === index;
      // return self.indexOf(value._id) === index;
    });

    //idAudit names
    let assetListNamesAuditMap = assetListNamesAudit.map(asset=>{
      // return asset.assetType._id.toString();
      return asset.assetTypeId.assetTypeClass;
    })

    var assetListNamesAuditUnique = assetListNamesAuditMap.filter(function (value, index, self) {
      return self.indexOf(value) === index;
      // return self.indexOf(value._id) === index;
    });

        let assetListIdMap = assetListId.map(asset=>{ //is this right -does this contain assets or id?
          return asset.assetType._id.toString();
        })
        console.log('This is assetListIdMap: ', assetListIdMap)
    var assetListIdUnique = assetListIdMap.filter(function (value, index, self) {
      return self.indexOf(value) === index;
      // return self.indexOf(value._id) === index;
    });
    

    var assetManufacturerUnique = assetManufacturer.filter(function (value, index, self) {
      // return self.indexOf(value.assetType.toString()) === index;
      return self.indexOf(value) === index;
    });

  console.log('directorateUnique', directorateUnique);
  console.log('rankUnique', rankUnique);
  console.log('assetListUnique', assetListUnique);
  console.log('assetListIdUnique', assetListIdUnique);
  console.log('assetListIdAuditUnique', assetListIdAuditUnique);
  console.log('assetListNamesAuditUnique', assetListNamesAuditUnique)

    objOptions.directorate = directorateUnique;
    objOptions.rank = rankUnique;
    objOptions.assetList = assetListUnique;
    objOptions.assetManufacturer = assetManufacturerUnique;
    objOptions.assetListId = assetListIdUnique;
    objOptions.assetListIdAudit = assetListIdAuditUnique
    objOptions.assetListNamesAudit = assetListNamesAuditUnique;

    console.log('Here is objOptions:', objOptions);

    res.send(objOptions);
});



app.get('/auditTrail2-Asset/:id', async (req, res)=>{
  console.log('Landed here Asset')
  let assetManufacturer = [];
  let lifeCycle = [];

  let objOptions ={lifeCycle:[], assetManufacturer:[]};
  console.log('This is id: ', req.params.id);
  var queryObj = JSON.parse(req.params.id);
  console.log('This is obj form: ', queryObj);

  let query =  assetTypeModel.find();
  // let query =  userModel.find();


  queryObj.auditField.forEach((audit, i)=>{
    query = query.where(audit).equals(queryObj.auditValue[i]);
  })

  // let auditQueryOptions = await query.populate('userOwnedAsset.id.assetType').exec();//userOwnedAsset.id is an asset //userOwnedAsset.id.assetType
  let auditQueryOptions = await query.exec();//userOwnedAsset.id is an asset //userOwnedAsset.id.assetType; //{path:'userOwnedAsset.id', model:assetModel, populate:{path:'assetType', model:assetTypeModel}}

  
  // let auditQueryOptions = await userModel.find({}).where(queryObj.auditField).equals(queryObj.auditValue);//populate('auditTrail.auditedBy')
  console.log('Length: ', auditQueryOptions.length);
  auditQueryOptions.forEach(asset=>{
    assetManufacturer.push(asset.assetTypeManufacturer);
    // objOptions.rank.push(asset.rank);
    lifeCycle.push(asset.assetTypeLifeCycle);
  })

  console.log('Asset Manufacturer: ', assetManufacturer)
  console.log('LifeCyle: ', lifeCycle);

  // making values unique
  var assetLifeCycleUnique = lifeCycle.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  }); 

  var assetManufacturerUnique = assetManufacturer.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });

console.log('assetManufacturerUnique', assetManufacturerUnique);
console.log('assetLifeCycleUnique', assetLifeCycleUnique);

  objOptions.assetLifeCycle = assetLifeCycleUnique;
  objOptions.assetManufacturer = assetManufacturerUnique;

  console.log('Here is objOptions:', objOptions);

  res.send(objOptions);
});


app.get('/saveFile/:id', async (req, res)=>{
  console.log('Got here..', req.params);
  let saveObj = JSON.parse(req.params.id);
  console.log('This is req.user, ', req.user);
  console.log('This is req.user, ', req.user._id);
  console.log('This is savedObj: ', saveObj.fName);

  const newSave = new savedSnapShotsModel({ //we're later getting asset from the form
    snapShotfileName:saveObj.fName,
    savedBy:req.user._id,
    savedObj:saveObj.savedObj
  })
   
  let savedItem = await newSave.save();
  console.log('This is saved item', savedItem);

  let user = await userCredModel.find({}).where('_id').equals(req.user._id);
      user[0].savedSnapShots.push(savedItem._id);
      await user[0].save();

  res.send({msg:'saved'});
});


app.get('/viewSavedSnapshots', async (req, res)=>{
  console.log('Gotten there...');
  let user = await userCredModel.find({}).where('_id').equals(req.user._id).populate('savedSnapShots');
  res.send(user[0].savedSnapShots);
})

app.delete('/deleteSavedSnapshots/:id', async (req, res)=>{
  console.log('Gotten there Delete...');
  console.log('delete id: ', req.params.id);
  console.log('delete id obj: ', JSON.parse(req.params.id));
  let savedItemIdVal = (JSON.parse(req.params.id)).savedItemId;
  let user = await userCredModel.find({}).where('_id').equals(req.user._id);//.populate('savedSnapShots');
  console.log(user[0].savedSnapShots);
  user[0].savedSnapShots.forEach((savedItemId, i)=>{
    if (savedItemId == savedItemIdVal){
      user[0].savedSnapShots.splice(i, 1);
    }
  })

  await user[0].save();
  res.send({'Item Deleted':req.params.id});
})


app.get('/getAssetTypes', async (req,res)=>{
  let assetTypes = await assetTypeAuditModel.find({}).select('_id assetType.assetTypeClass');
  
  res.send(assetTypes)
})
  
  app.get('/home', checkAuthenticated, async (req, res)=>{
    console.log(await req.user);
    console.log('This is email: ', await req.user.email);
    console.log(await req.user);
    res.render('home', {name: await req.user.userName});
  })

  
  app.delete('/logout', (req, res, next)=>{
    console.log('Logging out...');
    req.logOut(function (err){
      if (err) next(err);
      res.redirect('/login');
    });
  })
  
  async function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()) {
      console.log('In authenticated...')
      // console.log(await req.user);
      return next()
    }
    
    res.redirect('/login')
  }
  
  function checkNotAutheticated(req, res, next){
    if (req.isAuthenticated()){
      return res.redirect('/home')
    }
    next();
  }

  app.get('/videoAudit/:userId/:assetId/:roomId/:locationAudit/:genId/:postObj', hideNavMenu(), (req, res)=>{
    console.log('Query Object', req.params.genId);
    // console.log('Query Object Parsed', JSON.parse(req.params.queryObj));
    console.log('Readying for video...', req.params.roomId);
    console.log('Auditee Location obj...?', req.params.locationAudit);
    console.log(typeof ('This is type: ', req.params.locationAudit));
    console.log(`Auditee Location..., ${req.params.locationAudit.lat} and ${req.params.locationAudit.lng}`);
    console.log('This is the user ', req.params.userId);
    console.log('This is the user asset ', req.params.assetId);
    console.log('uiSettings: ', req.dispSetting);
    console.log('This is postObj:', req.params.postObj);
    
    res.render('audit/room', {userId: req.params.userId, assetId:req.params.assetId, roomId:req.params.roomId, locationAudit: JSON.parse(req.params.locationAudit), genId: req.params.genId, postObj: JSON.parse(req.params.postObj), uiSettings:req.dispSetting, auditor:req.user});
  });
 
  app.get('/assignAuditor/:assignObj', hideNavMenu(), async (req, res)=>{
   
      console.log('Assigning Auditor...');
      let assignObj = JSON.parse(req.params.assignObj);
      let assignedUserId = JSON.parse(req.params.assignObj).assignedUser;
      console.log('Assigned user: ', assignedUserId);
      let user = await userModel.find({}).where('_id').equals(assignedUserId);
      user[0].userRole.auditAssigns.push(assignObj);
      let assignedUser = await user[0].save();
      // res.send(JSON.stringify({assignedUser}));

       //Re-charting... 
              auditors = await userCredModel.find({}).where('subRole').equals('auditor');//.populate('profileId');
                          
              auditorsMap = auditors.map(auditor=>{
                  return auditor.profileId[0];
                })
                console.log('Mapped auditors ', auditorsMap);
                auditorsStaff = await userModel.find({}).where('_id').in(auditorsMap);
                let auditorObj = {}
                auditorsStaff.forEach(auditor=>{
                    // auditorObj[auditor._id] = 0;
                    auditorObj[auditor.firstName] = 0;
                });

                auditorsStaff.forEach(auditor=>{
                    // auditorObj[auditor._id] = auditor.userRole.auditAssigns.length;
                    auditorObj[auditor.firstName] = auditor.userRole.auditAssigns.length;
                });


      res.json(auditorObj);
    
    // res.render('audit/room', {userId: req.params.userId, assetId:req.params.assetId, roomId:req.params.roomId, locationAudit: JSON.parse(req.params.locationAudit), uiSettings:req.dispSetting});
  });


  app.get('/deleteAuditAssign/:obj', async (req, res)=>{
    console.log('hitting delete');
    console.log(req.params.obj);
    console.log(JSON.parse(req.params.obj));
    let objParse = (JSON.parse(req.params.obj));

    let auditUser = await userModel.find({}).where('_id').equals(objParse.assignedUser);
    console.log(auditUser[0].firstName);
    // auditUser[0].userRole.auditAssigns.forEach((auditObj, i)=>{
    //   if (JSON.stringify(auditObj) == req.params.obj.trim()){
    //     console.log(auditUser[0].userRole.auditAssigns.length);
    //     auditUser[0].userRole.auditAssigns.slice(i,1);
    //     console.log('Deleted', i);
    //     console.log(auditUser[0].userRole.auditAssigns.length);
    //   }
    // })
    let counter = 0;
    for (auditObj of auditUser[0].userRole.auditAssigns){
      if (JSON.stringify(auditObj) == req.params.obj.trim()){
        console.log(auditUser[0].userRole.auditAssigns.length);
        auditUser[0].userRole.auditAssigns.splice(counter,1);
        console.log('Deleted', counter);
        console.log(auditUser[0].userRole.auditAssigns.length);
        // await auditUser[0].save();
      }
      counter++
    }

    await auditUser[0].save();
    res.json({msg:'deleted'});
  });

  app.get('/checkIfAssignExists/:obj', async (req, res)=>{
    let auditObjExists = [];
    let auditorProfiles = [];
    console.log('From client: ', req.params.obj);

    let parseObj = JSON.parse(req.params.obj);
    let objKeys = Object.keys(JSON.parse(req.params.obj));
    // console.log('objKeys: ',  objKeys)
    console.log('parseObj: ',  parseObj);
    let objVals = Object.values(JSON.parse(req.params.obj));

    // let assignedAuditor = await userModel.find({}).where('_id').equals(parseObj['assignedUser']);
    let assignedAuditor = await userCredModel.find({}).where('subRole').equals('auditor');
      for (auditor of assignedAuditor){
          auditorProfiles.push(await userModel.findById({}).where('_id').equals(auditor.profileId[0]));
      }
console.log('This is auditorProfiles: ', auditorProfiles);

      for (auditorProfile of auditorProfiles){
        console.log(auditorProfile.firstName);
        auditorProfile.userRole.auditAssigns.forEach(auditObj=>{
          // console.log('Entered here1');
          if (auditObj.userState == parseObj.userState && auditObj.userDirectorate == parseObj.userDirectorate && auditObj.userRank == parseObj.userRank && auditObj.assetList == parseObj.assetList){
            console.log('Entered here2');
            auditObjExists.push(auditObj);// return true;
          }
        })
      }
    // console.log('This is auditor', assignedAuditor[0]);
    console.log('This is the audit', auditObjExists);

    // let auditObjExists = assignedAuditor[0].userRole.auditAssigns.filter(auditObj=>{
    //   if (auditObj.userState == parseObj.userState && auditObj.userDirectorate == parseObj.userDirectorate && auditObj.userRank == parseObj.userRank){
    //     return true;
    //   }
    // })
    console.log('auditObjExists: ', auditObjExists);
    res.json({'auditObjExists': auditObjExists})
   
  })


  app.get('/reAssignAuditor/:reAssignedAudit/:newAuditorId', async (req, res)=>{
    let auditorProfiles = [];
    console.log('RE-Assigning');
    console.log(req.params.reAssignedAudit);
    console.log(req.params.newAuditorId);

    let parseObj = JSON.parse(req.params.reAssignedAudit);

    let user = await userModel.findById({}).where('_id').equals(parseObj.assignedUser);
        user.userRole.auditAssigns.forEach((auditObj, i)=>{
          if (auditObj.userState == parseObj.userState && auditObj.userDirectorate == parseObj.userDirectorate && auditObj.userRank == parseObj.userRank){
                  console.log('Entered here2');
                  user.userRole.auditAssigns.splice(i,1);
                  // auditObjExists.push(auditObj);// return true;
            }
        })

        await user.save();

        //Now, work on To.
      let toUser = await userModel.findById({}).where('_id').equals(req.params.newAuditorId);
        toUserNewLength  = toUser.userRole.auditAssigns.push(parseObj)
        await toUser.save();

        //recharting
        //Re-charting... 
        let auditors = await userCredModel.find({}).where('subRole').equals('auditor');//.populate('profileId');
                          
        let auditorsMap = auditors.map(auditor=>{
            return auditor.profileId[0];
          })
          console.log('Mapped auditors ', auditorsMap);
          let auditorsStaff = await userModel.find({}).where('_id').in(auditorsMap);
          let auditorObj = {}
          auditorsStaff.forEach(auditor=>{
              // auditorObj[auditor._id] = 0;
              auditorObj[auditor.firstName] = 0;
          });

          auditorsStaff.forEach(auditor=>{
              // auditorObj[auditor._id] = auditor.userRole.auditAssigns.length;
              auditorObj[auditor.firstName] = auditor.userRole.auditAssigns.length;
          });
          // res.json(auditorObj);
        res.send(JSON.stringify(auditorObj)); //ideally, this length should be more than what it was before the assignment
  });
  
  
  app.use('/user', checkAuthenticated, userRoute);
  app.use('/asset', checkAuthenticated, assetRoute);
  app.use('/assetType', checkAuthenticated, assetTypeRoute);
  app.use('/contractor', checkAuthenticated, contractorRoute);
  app.use('/overview', checkAuthenticated, overviewRoute);
  



  //
  // const pServer = app.listen(9000);

  // const peerServer = ExpressPeerServer(pServer, {
  //   path: '/assetmanger.herokuapp.com'
  // });

  // app.use('/peerjs', peerServer);


  // const http = require('http');

//   


// const pServer = http.createServer(app);
// /////assetmanger.herokuapp.com
// const peerServer = ExpressPeerServer(pServer, {
//   debug: true,
//   path: '/assetmangerer.herokuapp.com'
// });

// app.use('/peerjs', peerServer);

// pServer.on('connection', function(client){
//   console.log(client);
//   console.log('Connected right now!');
// });

// pServer.on('disconnect', (client)=>{
//   console.log(client);
//   console.log('Thing is disconnected...');
// });

// pServer.listen(9000);
  
  
  // httpServer.listen(process.env.PORT || 4000);
  // httpsServer.listen(process.env.PORT || 3000);
  // app.listen(process.env.PORT || 2000)

  
  //app.listen(process.env.PORT || 2000);
  
// module.exports = io;
//module.exports = "This is going somewhere";