if (process.env.NODE_ENV !=='production'){
  var dotEnv =  require('dotenv');
  dotEnv.config();
}

let express = require('express');
let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let mongoose = require('mongoose');
const QRCode = require('qrcode');
let app = express();
const http = require('http');
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  'cert':fs.readFileSync('./https/cert.pem'),
  'key':fs.readFileSync('./https/key.pem')
}

// const app = require('https-localhost')();

console.log(httpsOptions)

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true }); //play around with this
const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to mongoose'));



let userRoute = require('./routes/user.js');
let assetRoute = require('./routes/asset.js');
let assetTypeRoute = require('./routes/assetType.js');
let contractorRoute = require('./routes/contractor.js');

let userModel = require('./User.js');

const bodyParser = require('body-parser');
const { fstat } = require('fs');

app.use(bodyParser.urlencoded({limit: '10mb', extended:false}));

app.use('/user', userRoute);
app.use('/asset', assetRoute);
app.use('/assetType', assetTypeRoute);
app.use('/contractor', contractorRoute);



app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout');

app.use(express.static('public'));

// app.use('/user', userRoute);
app.use(layout);

var sega= [
  {datal:"I love you", model:'alphanumeric'},
  {datal: '200', model: "numeric"}
]
var segaVar = JSON.stringify(sega);

app.get('/', (req, res)=>{
    console.log('I am working...');
    // res.send('Working too')
    QRCode.toDataURL(segaVar, {type:'terminal'}, function(err, url){
      console.log(url);
      res.render('userform', {code:url});
    })
    //, {msg:'error message goes in here'}
  });


// httpServer = http.createServer(app);
// httpsServer = https.createServer(httpsOptions,app);

// httpServer.listen(process.env.PORT || 2000);
// httpsServer.listen(process.env.PORT || 3000);
app.listen(process.env.PORT || 2000)


//app.listen(process.env.PORT || 2000);