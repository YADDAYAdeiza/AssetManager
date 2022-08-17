if (process.env.NODE_ENV !=='production'){
  var dotEnv =  require('dotenv');
  dotEnv.config();
}

// const { PeerServer } = require('peer');

// const peerServer = PeerServer({ port: 9000, path: '/assetmanger.herokuapp.com' });


let express = require('express');
//
const { ExpressPeerServer } = require('peer');
//
let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let mongoose = require('mongoose');
// const QRCode = require('qrcode');
let app = express();
const http = require('http');
const https = require('https');
const methodOverride = require('method-override')
const bcrypt =  require('bcrypt');

let cors = require('cors');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4:uuidV4} = require('uuid');

// app.use(cors());

//authentication
let {role} = require('./role.js');



console.log(role);

// const userModel = require('models/user.js');

 


app.get('/audit', (req,res)=>{
    // res.send('Auditing...');
    res.redirect(`/audit/${uuidV4()}`)
})

app.get('/audit/:room', (req,res)=>{
    // res.send('Getting room...');
    res.render('audit/room', {roomId:req.params.room})
})

io.on('connection', socket=>{
    socket.on('join-room', (roomId, userId)=>{
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId)
      // socket.broadcast.to(roomId).emit("hello", "world");
      //socket.to(roomId).broadcast.emit('user-connected', userId)

      socket.on('disconnect', ()=>{
        //socket.to(roomId).emit('user-disconnected', userId)
        socket.to(roomId).broadcast.emit('user-disconnected', userId)
      })
    })
  })


server.listen(process.env.PORT || 2000);
  
  
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true }); //play around with this
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
  
  app.get('/login', checkNotAutheticated, (req, res)=>{
    res.render('userform');
  })
  
  app.post('/login', checkNotAutheticated, passport.authenticate('local',{
    successRedirect:'/user/new',
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
  
  app.get('/home', checkAuthenticated, async (req, res)=>{
    console.log(await req.user);
    console.log('This is email: ', await req.user.email);
    console.log(await req.user);
    res.render('home', {name: await req.user.userName});
  })

  
  app.delete('/logout', (req, res, next)=>{
    req.logOut(function (err){
      if (err) next(err);
      res.redirect('/login');
    });
  })
  
  async function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
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