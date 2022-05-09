let express = require('express');
let route = express.Router();
let fs = require('fs');
let path = require('path');
let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let assetTypeModel = require('../models/assetType');
const multer = require('multer');

const uploadPath = path.join('public', assetTypeModel.assetTypeImagePath);

const assetTypeUploadOptions = multer({
    dest: uploadPath,
});

//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);


let userVar = 'trial';
//get all assets

route.get('/serial', async (req, res)=>{
    console.log(req.query.selAssType);

   var da =  await assetTypeModel.find({}).where('assetClass').equals(req.query.selAssType);
   console.log(da);
    res.json({'done': da[da.length-1].assetTypeCode});
})
route.get('/index', async (req, res)=>{
    // res.send('Book stuff...')
    var assetTypes = await assetTypeModel.find({});
    console.log(assetTypes);
    res.render('assetType/index.ejs', {assetTypes:assetTypes});
})

//get the create new form for new book
route.get('/new', async (req,res)=>{
    // res.send('What item now');
    // res.send('Asset form');
   // res.render('./asset/new.ejs', {asset:assetModel});
   const assetTypesArr = await assetTypeModel.find({});
   assetTypesArr.sort((a,b)=>{
        if (a.assetClass > b.assetClass){
            return 1
        }

        if (a.assetClass < b.assetClass){
            return -1
        }

        return 0;
   });
   console.log(assetTypesArr);

    //res.render('AssetType/new.ejs', {assetType: new assetTypeModel()}); //tying the view to the moongoose model
    res.render('AssetType/new.ejs', {assetType: assetTypesArr}); //tying the view to the moongoose model
})

//create new book
route.post('/', assetTypeUploadOptions.single('assetTypePic'), async (req,res)=>{
    // console.log(req.body);
console.log(req.file.filename);
if (req.file.filename != null){
    var fileName = req.file.filename;
    console.log('This is filename');
    console.log(fileName);
}
    var asset = new assetTypeModel({
        assetTypeCode: req.body.assetNumber,
        assetTypeClass:req.body.assetTypeName,
        assetTypePic: fileName
    })

    try{
       var assetType = await asset.save();
        console.log('This is assetType: ');
        console.log(assetType);
        console.log(assetType.assetTypePic);
    } catch(e){
        console.log(e.message);
        if (assetType.assetTypePic != null){
            removeAssetTypePic(assetType.assetTypePic);
        }
    }
//    res.send('List of AssetTypes');
    
})

function removeAssetTypePic(assetPicName){
    fs.unlink(path.join(uploadPath, assetPicName), err=>{
        if (err) console.error(err)
    })
}


module.exports = route;
