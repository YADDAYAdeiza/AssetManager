let express = require('express');
let route = express.Router();

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
const assetModel = require('../models/asset.js');
// const { rawListeners } = require('../models/assetType.js');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];



//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


// let userVar = 'trial';
//get all users of assets

route.get('/national', (req, res)=>{
res.render('overview/national.ejs')
})


route.get('/metrics', (req, res)=>{
    res.send('Dashboard goes in here');
})


route.get('/index', async (req, res)=>{
    res.send('overview index')
})



module.exports = route;
