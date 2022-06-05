let express = require('express');
let route = express.Router();
let fs = require('fs');
let path = require('path');
let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let contractorModel = require('../models/contractor')
let assetTypeModel = require('../models/assetType');
let assetModel = require('../models/asset');
let userModel = require('../models/user');
const multer = require('multer');

// const uploadPath = path.join('public', assetTypeModel.assetTypeImagePath);

// const assetTypeUploadOptions = multer({
//     dest: uploadPath,
// });

//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


// let userVar = 'trial';
//get all assets

route.get('/serial', async (req, res)=>{

//    var da =  await assetTypeModel.find({}).where('assetClass').equals(req.query.selAssType);
//     res.json({'done': da[da.length-1].assetTypeCode});
})
route.get('/index', async (req, res)=>{
    // res.send('Book stuff...')
    // var assetTypes = await assetTypeModel.find({});
    // res.send('Working too')
    var user;
    var asset
    var assetType;
    var contractor;
    try{
      user = await userModel.find().sort({dateCreated:'desc'}).limit(10).exec();//775, 780
    //    asset = await assetModel.find().sort({assignDate:'desc'}).limit(4).exec();//775, 780
    //    assetType = await assetTypeModel.find().sort({assignDate:'desc'}).limit(4).exec();//775, 780
      
    }catch{
      user = [];
    //    asset = [];
    //    assetType = [];
    }

    try{
        // user = await userModel.find().sort({dateCreated:'desc'}).limit(4).exec();//775, 780
         asset = await assetModel.find().sort({assignDate:'desc'}).limit(20).exec();//775, 780
      //    assetType = await assetTypeModel.find().sort({assignDate:'desc'}).limit(4).exec();//775, 780
      }catch{
        // user = [];
         asset = [];
      //    assetType = [];
      }

      try{
        // user = await userModel.find().sort({dateCreated:'desc'}).limit(4).exec();//775, 780
      //    asset = await assetModel.find().sort({assignDate:'desc'}).limit(4).exec();//775, 780
         assetType = await assetTypeModel.find().sort({assignDate:'desc'}).limit(20).exec();//775, 780
        
      }catch{
        // user = [];
      //    asset = [];
         assetType = [];
      }

      try{
        // user = await userModel.find().sort({dateCreated:'desc'}).limit(4).exec();//775, 780
         contractor = await contractorModel.find().sort({assignDate:'desc'}).limit(20).exec();//775, 780
      //    assetType = await assetTypeModel.find().sort({assignDate:'desc'}).limit(4).exec();//775, 780
      // console.log('__________')
      // console.log(contractor);
      // console.log('*****')
      }catch(e){
        console.error(e);
        // user = [];
         contractor = [];
      //    assetType = [];
      }

      
    res.render('recent/index.ejs', {users:user, asset:asset, assetType:assetType, contractor:contractor}); 
});

//get the create new form for new book
route.get('/new', async (req,res)=>{
    // res.send('What item now');
    // res.send('Asset form');
   // res.render('./asset/new.ejs', {asset:assetModel});
//    const assetTypesArr = await assetTypeModel.find({});
//    assetTypesArr.sort((a,b)=>{
//         if (a.assetClass > b.assetClass){
//             return 1
//         }

//         if (a.assetClass < b.assetClass){
//             return -1
//         }

//         return 0;
//    });

    //res.render('AssetType/new.ejs', {assetType: new assetTypeModel()}); //tying the view to the moongoose model
    // res.render('AssetType/new.ejs', {assetType: assetTypesArr}); //tying the view to the moongoose model
})

//create new book
route.post('/', async (req,res)=>{
// if (req.file.filename != null){
//     var fileName = req.file.filename;
// }
//     var asset = new assetTypeModel({
//         assetTypeCode: req.body.assetNumber,
//         assetTypeClass:req.body.assetTypeName,
//         assetTypePic: fileName
//     })

//     try{
//        var assetType = await asset.save();
//     } catch(e){
//         if (assetType.assetTypePic != null){
//             removeAssetTypePic(assetType.assetTypePic);
//         }
//     }
//    res.send('List of AssetTypes');
    
})

function removeAssetTypePic(assetPicName){
    // fs.unlink(path.join(uploadPath, assetPicName), err=>{
    //     if (err) console.error(err)
    // })
}


module.exports = route;
