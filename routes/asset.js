let express = require('express');
let route = express.Router();

let ejs = require('ejs');
let layout = require('express-ejs-layouts');

let assetModel = require('../models/asset.js');
let assetTypeModel = require('../models/assetType.js');
const path  = require('path');
const multer = require('multer');
//route.set('layout', 'layouts/layout');

var uploadPath = assetModel.uploadAssetPath;
const assetUploadOptions = multer({
    dest:path.join('public', uploadPath)
})

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
    if (a.assetTypeClass > b.assetTypeClass){
        return 1
    }

    if (a.assetTypeClass < b.assetTypeClass){
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
route.post('/', assetUploadOptions.single('assetPic'), async (req,res)=>{
    if (req.file.filename != null){
        var fileName = req.file.filename;
    }
    console.log('This is filename ', fileName)
    var assetItem = new assetModel({
        assetImageName: fileName,
        assetType: req.body.selAssetType
    })
    console.log(assetItem);
    console.log('This is asset above');
    
    try{
        var newAsset = await assetItem.save();
        console.log('This is newAsset');
        console.log(newAsset);
        res.redirect('asset/index');
    }catch (e){
        // console.log(e.message);
        if (newAsset.assetImageName != null){
            removeAssetTypePic(newAsset.assetImageName);
        }
    }
   
})

function removeAssetPic(assetPicName){
    fs.unlink(path.join(uploadPath, assetPicName), err=>{
        if (err) console.error(err)
    })
}


module.exports = route;
