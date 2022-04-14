let express = require('express');
let ejs = require('ejs');
let layout = require('express-ejs-layouts');

let userRoute = require('./routes/user.js');

//app.use('/user', userRoute);

let app = express();


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

app.get('/register', (req,res)=>{
    res.send('What item now');
})



app.listen(process.env.PORT || 2000);