let express = require('express');
let route = express.Router();

let ejs = require('ejs');
let layout = require('express-ejs-layouts');

let assetTypeModel = require('../models/assetType');
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
route.post('/',  async (req,res)=>{

   
    // console.log(req.body);
    try{
       var assetType = await assetTypeModel.create({
            assetTypeCode: req.body.assetNumber,
            assetClass:req.body.assetTypeName
        })
    } catch(e){
        console.log(e.message);
    }
//    res.send('List of AssetTypes');
    
})


module.exports = route;
