let userModel = require('./models/user');
let assetTypeModel = require('./models/assetType');
let assetTypeAuditModel = require('./models/assetType_Audit');

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
const io = require('socket.io')(server);
const {v4:uuidV4} = require('uuid');


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
  origin:"https:127.0.0.1:2000",
  method:["GET", "POST", "PUT"],
  allowedHeaders: "*",
  exposedHeaders:"content-disposition"
}));

//authentication
let {role} = require('./role.js');



console.log(role);

// const userModel = require('models/user.js');


io.on('connection', socket=>{
    socket.on('join-room', (roomId, userId)=>{
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId)
      // socket.broadcast.to(roomId).emit("hello", "world");
      //socket.to(roomId).broadcast.emit('user-connected', userId)

      socket.on('disconnect', ()=>{
        socket.to(roomId).emit('user-disconnected', userId)
        // socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })
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
 console.log(user);
 console.log([1,2,3,4]);
 return user[0];

},  async (id)=>{
   let user = await userCredModel.findById(id);
    console.log('User gotten by id:')
    console.log(user);
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

  app.get('/dana/:assetUuid', async (req, res)=>{
    console.log('This is the user');
    // res.send('Working too')
    
    
    QRCode.toDataURL(`https://assetmanger.herokuapp.com/${req.params.assetUuid}`, {type:'terminal'}, function(err, url){
        res.render('userform', {code:url});
    })
    // res.render('landingPage');//code:url,
    //, {msg:'error message goes in here'}
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
    res.redirect(`/audit/${uuidV4()}`)
})

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
                            query = query.where('userAsset.id').ne(null); //users with Assets
                            // query.where(userAsset.id).equals
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
                                  for (var a=0;a<user.userAsset.idAudit.length;a++){
                                    idAuditObj[user.id] = {userObj:[]}
                                  }
                                   
                                })



                                let dateObj;
                              //  let userToBeAudited = users.filter(user=>{
                              //     for (var a=0;a<user.userAsset.idAudit.length;a++){
                              //       let diffTime = Date.now() - user.userAsset.idAudit[a].auditDate;
                              //       console.log('New Date object: ', new Date(diffTime));
                              //       dateObj = new Date(diffTime * 1000);
                              //       console.log('Query', req.query);
                              //       console.log('Before', req.query.userDateBeforeSearch);
                              //       console.log('New Date hours: ', new Date(diffTime).getHours());
                              //       console.log('New Date Date: ', new Date(diffTime).getDate());
                              //       console.log('Time lapse: ',typeof(user.userAsset.idAudit[a].auditDate));
                              //       console.log('Time lapse: ', Date.now() - user.userAsset.idAudit[a].auditDate);
                              //       console.log('Time lapse: ', req.query.userDateBeforeSearch - user.userAsset.idAudit[a].auditDate);
                                    
                              //       let numOfDays = (new Date(Date.now()).getTime() - user.userAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                              //         console.log('Asset ', user.userAsset.idAudit[a].id);
                              //         console.log('Number of Days (rounded), ', Math.round(numOfDays));
                              //         // if ((req.query.userDays) == Math.ceil(numOfDays)){
                              //           user.userAsset.idAudit[a].firstName = user.firstName
                              //           user.userAsset.idAudit[a].userId = user.id
                              //           auditArr.push(user.userAsset.idAudit[a])
                              //           idAuditObj[user.id].push(user.userAsset.idAudit[a])
                              //         // }
                              //       //req.query.userDateBeforeSearch
                              //       // return (user.userAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                              //     }
                              //     // return user.userAsset.idAudit.forEach(assetObj=>{
                              //     //   console.log('Audit enter');
                              //     //   console.log('obj', assetObj);
                              //     //   console.log('in String', assetObj.id.toString());
                              //     //   return (assetObj.id.toString() == '63a1e335bc9dbf8077de0dc9');
                                    
                              //     // })
                              //   })

                              users.forEach(user=>{
                                for (var a=0;a<user.userAsset.idAudit.length;a++){
                                  
                                  let numOfDays = (new Date(Date.now()).getTime() - user.userAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                  console.log('Asset ', user.userAsset.idAudit[a].id);
                                  console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                  if (req.query.userDays){
                                    console.log('First...')
                                    if (Math.ceil(numOfDays) > (req.query.userDays) ||Math.ceil(numOfDays) == (req.query.userDays) ){
                                      // user.userAsset.idAudit[a].firstName = user.firstName
                                      // user.userAsset.idAudit[a].userId = user.id
                                      // auditArr.push(user.userAsset.idAudit[a])
                                      idAuditObj[user.id].firstName = user.firstName
                                      idAuditObj[user.id].userObj.push(user.userAsset.idAudit[a])
                                    }

                                  }else {
                                    console.log('Second');
                                      // user.userAsset.idAudit[a].firstName = user.firstName
                                      // user.userAsset.idAudit[a].userId = user.id
                                      // auditArr.push(user.userAsset.idAudit[a])
                                      // idAuditObj[user.id].push(user.userAsset.idAudit[a])
                                      idAuditObj[user.id].firstName = user.firstName
                                      idAuditObj[user.id].userObj.push(user.userAsset.idAudit[a])

                                  }
                                  // return (user.userAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                }
                                // return (auditArr);
                                // auditArr.push(user.userAsset.idAudit[a])

                               
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

app.get('/audGoLive', async (req, res)=>{
  let auditArr = [];
  console.log(req.query);
  console.log('Hitting...');
  console.log(req.query.userDateBeforeSearch);

  let userApprovalRoles = await userModel.find({}).where('approvalStatus').ne(null).distinct('approvalStatus');
  // let distinctAssets =  await assetTypeModel.find({}).distinct('assetTypeClass')
                let distinctAuditAssets;
                try{
                  distinctAuditAssets =  await assetTypeAuditModel.find({}).populate('assetType');//.select('assetTypeClass assetTypeAuditInterval');

                }catch(e){
              console.error(e)
                }
  // let distinctAuditAssets =  await assetTypeAuditModel.find({}).select('assetTypeClass assetTypeAuditInterval');
                            // let userStoreApprovalRoles = await userModel.find({}).where('userStoreApproval').ne(null).distinct('approvalStatus');
                            // let query = req.queryObj; //from permitLists middleware
                            let query = userModel.find(); //from permitLists middleware
                            console.log('Back here');
                            // console.log(query);
                            query = query.where('userAsset.id').ne(null); //users with Assets
                            // query.where(userAsset.id).equals
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

                            let uiSettings = req.dispSetting;
                            let userName = req.user.userName;
                            console.log('This is userName, ', userName);
                            console.log('These are assetTypes: ', distinctAuditAssets);
                              try{
                                  const users = await query.exec();
  
                                  let dateObj;
                                  console.log('Today ',new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00'))
                                  let diffT = new Date(Date.now()) - new Date('2022-12-20T16:30:45.684+00:00')
                                  console.log('Number of Hours', new Date(diffT).getHours());
                                
                                  //Now, we need to get into the for loop
                                  console.log('This is users', users);
                                  let idAuditObj = {};
                                  users.forEach(user=>{
                                    for (var a=0;a<user.userAsset.idAudit.length;a++){
                                      idAuditObj[user.id] = {userObj:[]}
                                    }
                                  })

                                 users.forEach(user=>{
                                    for (var a=0;a<user.userAsset.idAudit.length;a++){
                                      // let diffTime = Date.now() - user.userAsset.idAudit[a].auditDate;
                                      // let diffTime = new Date(req.query.userDateBeforeSearch) - user.userAsset.idAudit[a].auditDate;
                                      
                                      // console.log('New Date object: ', new Date(diffTime));
                                      // dateObj = new Date(diffTime * 1000);
                                      // console.log('Query', req.query);
                                      // console.log('Before', req.query.userDateBeforeSearch);
                                      // console.log('Before Object', new Date(req.query.userDateBeforeSearch));
                                      // console.log('New Date hours: ', new Date(diffTime).getHours());
                                      // console.log('New Date Date: ', new Date(diffTime).getDate());
                                      // console.log('Time lapse: ',typeof(user.userAsset.idAudit[a].auditDate));
                                      // console.log('Time lapse: ', new Date(Date.now()) - user.userAsset.idAudit[a].auditDate);
                                      // console.log('Time lapse: ', new Date(req.query.userDateBeforeSearch) - user.userAsset.idAudit[a].auditDate);
                                      // let lapse = new Date(new Date(req.query.userDateBeforeSearch) - user.userAsset.idAudit[a].auditDate);
                                      // let lapse2 = new Date(new Date(Date.now()) - user.userAsset.idAudit[a].auditDate);
                                      // console.log('This is lapse', lapse.getHours());
                                      // console.log('This is lapse', lapse.getDay());
                                      // console.log('This is lapse2', lapse2.getDay());
                                      // console.log('Time lapse now: ', new Date(req.query.userDateBeforeSearch).getTime() - user.userAsset.idAudit[a].auditDate.getTime());
                                      // let numOfDays = (new Date(req.query.userDateBeforeSearch).getTime() - user.userAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                      let numOfDays = (new Date(Date.now()).getTime() - user.userAsset.idAudit[a].auditDate.getTime())/(1000*60*60*24);
                                      console.log('Asset ', user.userAsset.idAudit[a].id);
                                      console.log('Number of Days (rounded), ', Math.round(numOfDays));
                                      // console.log('First...')
                                    if ( Math.ceil(numOfDays) > (req.query.userDays) ||Math.ceil(numOfDays) == (req.query.userDays )){
                                      // user.userAsset.idAudit[a].firstName = user.firstName
                                      // user.userAsset.idAudit[a].userId = user.id
                                      // auditArr.push(user.userAsset.idAudit[a])
                                      
                                      idAuditObj[user.id].userProfilePic = user.userProfilePic;
                                      idAuditObj[user.id].firstName = user.firstName;
                                      idAuditObj[user.id].userObj.push(user.userAsset.idAudit[a]);
                                    }
                                      // return (user.userAsset.idAudit[a].id.toString() == '63a1e335bc9dbf8077de0dc9');
                                    }
                                    // return (auditArr);
                                    // auditArr.push(user.userAsset.idAudit[a])

                                   
                                  })
                                  console.log('This is userToBeAudited...', auditArr);
                                  console.log('This is userToBeAudited2...', idAuditObj);
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
                                      distinctAuditAssets,
                                      dateObj
                                  });                        
                              }catch(e) {
                                console.error(e);
                                  console.log('An error occured');
                                  res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                              }

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
      console.log(await req.user);
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