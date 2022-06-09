if (process.env.NODE_ENV !=='production'){
  var dotEnv =  require('dotenv');
  dotEnv.config();
}

let express = require('express');
let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let mongoose = require('mongoose');
// const QRCode = require('qrcode');
let app = express();
const http = require('http');
const https = require('https');
const methodOverride = require('method-override')

const {v4:uuidV4} = require('uuid');
var server = require('http').Server(app);
var io = require('socket.io')(server);


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

      socket.on('disconnect', ()=>{
        socket.to(roomId).emit('user-disconnected', userId)
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

let userModel = require('./models/user.js');

const bodyParser = require('body-parser');
// const { fstat } = require('fs');



app.use(bodyParser.urlencoded({limit: '10mb', extended:false}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout');

app.use(layout);
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.use('/user', userRoute);
app.use('/asset', assetRoute);
app.use('/assetType', assetTypeRoute);
app.use('/contractor', contractorRoute);
app.use('/overview', overviewRoute);

app.use('/recent', recentRoute);




// app.use('/user', userRoute);

// var sega= [
//   {datal:"I love you", model:'alphanumeric'},
//   {datal: '200', model: "numeric"}
// ]
// var segaVar = JSON.stringify(sega);

app.get('/', async (req, res)=>{
    // res.send('Working too')
    var user;
    try{
      user = await userModel.find().sort({dateCreated:'desc'}).limit(3).exec();//775, 780
    }catch{
      user = [];
    }

    // QRCode.toDataURL(segaVar, {type:'terminal'}, function(err, url){
    //   res.render('userform', {code:url, users:user});
    // })
    res.render('userform', { users:user});//code:url,
    //, {msg:'error message goes in here'}
  });




// httpServer.listen(process.env.PORT || 4000);
// httpsServer.listen(process.env.PORT || 3000);
// app.listen(process.env.PORT || 2000)


//app.listen(process.env.PORT || 2000);

// module.exports = io;
//module.exports = "This is going somewhere";