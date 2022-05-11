let express = require('express');
let route = express.Router();

let ejs = require('ejs');
let layout = require('express-ejs-layouts');

let assetModel = require('../models/asset.js');
let assetTypeModel = require('../models/assetType.js');
//route.set('layout', 'layouts/layout');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];


route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);


let userVar = 'trial';
//get all assets
route.get('/index', async (req, res)=>{
    // res.send('Book stuff...');
   let assetModelVar = await assetModel.find({});
    res.render('./asset/index.ejs', {asset:assetModelVar, searchOptions:"my name"});
})

//get the create new form for new book
route.get('/new', async (req,res)=>{
   var assetTypeModelVar = await assetTypeModel.find({});
   assetTypeModelVar.sort((a,b)=>{
    if (a.assetTypeClass > b.assetTypeClass){
        return 1
    }

    if (a.assetTypeClass < b.assetTypeClass){
        return -1
    }

    return 0;
});
    // res.send('What item now');
    // res.send('Asset form');
    res.render('./asset/new.ejs', {asset:assetModel, assetType:assetTypeModelVar});
    //res.render('user/new.ejs', {user: new userModel()}); //tying the view to the moongoose model
})

//create new book
route.post('/', async (req,res)=>{
    
    var assetItem = new assetModel({
        assetType: req.body.selAssetType
    })

    saveAssetImageDetails(assetItem, req.body.assetPic);
    
    try{
        var newAsset = await assetItem.save();
        res.redirect('asset/index');
    }catch (e){
        
    }
   
})


function saveAssetImageDetails(user, encodedProfile){
    if (encodedProfile == null) return

    const profile = JSON.parse(encodedProfile);
    if (profile !=null && imageMimeTypes.includes(profile.type)){
        user.assetImageName = new Buffer.from(profile.data, 'base64');
        user.assetImageType = profile.type;
    }

}


module.exports = route;
