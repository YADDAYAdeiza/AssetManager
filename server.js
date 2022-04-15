if (process.env.NODE_ENV !=='production'){
  var dotEnv =  require('dotenv');
  dotEnv.config();
}

let express = require('express');
let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let mongoose = require('mongoose');
let app = express();

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true }); //play around with this
const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to mongoose'));

let userRoute = require('./routes/user.js');

app.use('/user', userRoute);



app.set('view engine', 'ejs');
app.set('views', __dirname+ '/views')
app.set('layout', 'layouts/layout');

app.use(express.static('public'));

app.use('/user', userRoute);

app.use(layout);


app.get('/', (req, res)=>{
    console.log('I am working...');
    // res.send('Working too')
    res.render('general');
});





app.listen(process.env.PORT || 2000);