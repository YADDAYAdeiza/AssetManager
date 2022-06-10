let express = require('express');
let route = express.Router();

let mongoose = require('mongoose');

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


route.get('/metrics', async (req, res)=>{
    // let uniqueAssetModelItems = await assetTypeModel.find().distinct('assetTypeClass');
    let uniqueAssetModelItems = await assetTypeModel.find({}, '_id, assetTypeClass').exec();
    console.log(uniqueAssetModelItems);
    res.render('overview/metrics.ejs', {uniqueAssetModelItems});
})

route.get('/:id/metrics', async(req, res)=>{
    console.log('Metric: this is overview ', req.params.id)
    // const asset = await assetModel.find({id:mongoose.Types.ObjectId(req.params.id)}, 'assetCode, assetType').exec();
    try{
        if (req.params.id =='all'){
            console.log('*****inside all')
            var asset = await assetModel.find({}, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec();
        }else{
            var asset = await assetModel.find({assetType:mongoose.Types.ObjectId(req.params.id)}, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec();
            console.log(asset);
        }
        res.send(JSON.stringify(asset));
    }catch (e){
        console.log(e);
    }
});


route.get('/index', async (req, res)=>{
    res.send('overview index')
})



module.exports = route;
