let express = require('express');
let route = express.Router();

let ejs = require('ejs');
let layout = require('express-ejs-layouts');

//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);

route.get('/', (req, res)=>{
    // res.send('From user route')
    res.render('userform.ejs');
})

route.get('/register', (req,res)=>{
    res.send('What item now');
})


module.exports = route;
