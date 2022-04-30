let express = require('express');
let route = express.Router();

let ejs = require('ejs');
let layout = require('express-ejs-layouts');

let assetModel = require('../models/asset');
let assetTypeModel = require('../models/assetType.js');
//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);


let userVar = 'trial';
//get all assets
route.get('/index', async (req, res)=>{
    // res.send('Book stuff...');
    console.log('*******');
   let assetModelVar = await assetModel.find({});
    res.render('./asset/index.ejs', {asset:assetModelVar, searchOptions:"my name"});
})

//get the create new form for new book
route.get('/new', async (req,res)=>{
   var assetTypeModelVar = await assetTypeModel.find({});
   assetTypeModelVar.sort((a,b)=>{
    if (a.assetClass > b.assetClass){
        return 1
    }

    if (a.assetClass < b.assetClass){
        return -1
    }

    return 0;
});
    console.log('-----')
    console.log(assetTypeModelVar);
    // res.send('What item now');
    // res.send('Asset form');
    res.render('./asset/new.ejs', {asset:assetModel, assetType:assetTypeModelVar});
    //res.render('user/new.ejs', {user: new userModel()}); //tying the view to the moongoose model
})

//create new book
route.post('/',  async (req,res)=>{
    try{
        var assetModelVar = await assetModel.create({});
        console.log(assetModelVar);
        res.redirect('asset/index');
    }catch (e){
        // console.log(e.message);
    }
   
})


module.exports = route;
