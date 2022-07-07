let express = require('express');
let route = express.Router();

let mongoose = require('mongoose');

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
const assetModel = require('../models/asset.js');
const { reset } = require('nodemon');
// const { rawListeners } = require('../models/assetType.js');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];



//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


// let userVar = 'trial';
//get all users of assets

route.get('/user/index', async (req, res)=>{
    
    let users = await userModel.find({}).select('firstName lastName state geoCoord');
    res.json(users);
})

route.get('/national', (req, res)=>{
res.render('overview/national.ejs')
})


route.get('/metrics', async (req, res)=>{
    // let uniqueAssetModelItems = await assetTypeModel.find().distinct('assetTypeClass');
    let uniqueAssetModelItems = await assetTypeModel.find({}, '_id, assetTypeClass').exec();
    let uniqueStates = await userModel.find({}, '_id, state').distinct('state').exec();
    let uniqueCadres = await userModel.find({}, '_id, cadre').distinct('cadre').exec();
    console.log(uniqueAssetModelItems);
    console.log(uniqueStates);
    res.render('overview/metrics.ejs', {uniqueAssetModelItems, uniqueStates, uniqueCadres});
})



route.get('/:id/metrics', async(req, res)=>{
    console.log('Metric: this is overview ', req.params.id)
    console.log('Using req.query', req.query);
    // const asset = await assetModel.find({id:mongoose.Types.ObjectId(req.params.id)}, 'assetCode, assetType').exec();
    try{
        var assetLength =  (await assetModel.find()).length;
        var assetAssignedLength =  (await assetModel.find().where('allocationStatus').equals(true)).length;
        console.log('Affected Assets');
        console.log(assetAssignedLength);
        var requisitionLength =  (await userModel.find().where('userRequisition').ne(null)).length;
        if (req.params.id =='all'){
            console.log('*****inside all');
            var asset = await assetModel.find({}, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec();
            console.log(asset);
            console.log(assetLength);
        }else{
            var asset = await assetModel.find({assetType:mongoose.Types.ObjectId(req.query.assetId)}, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec();
            console.log(asset);
            console.log(assetLength);
            console.log('Requisition length: ', requisitionLength);
        }
        var assetObj = {
            asset,
            total:assetLength,
            requisition:requisitionLength,
            assetAssigned:assetAssignedLength
        }
        res.send(JSON.stringify(assetObj));
    }catch (e){
        console.log(e);
    }
});

route.get('/:id/:jd/metricOther', async(req, res)=>{
    console.log('Metric: this is overview Other id ', req.params.id)
    console.log('Metric: this is overview Other jd', req.params.jd)
    // const asset = await assetModel.find({id:mongoose.Types.ObjectId(req.params.id)}, 'assetCode, assetType').exec();
    try{

        if (req.params.jd =='All'){
            //users with assets
            console.log('*****inside all')
            var asset = await userModel.find().where(req.params.id).ne(null).select(`_id, lastName, ${req.params.id}`) //, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec(); //.where('userAsset').ne(null)
            console.log(asset);
        }else{
            //users with specific assets
            console.log('Not All--');
            var asset = await userModel.find().where(req.params.id).equals(req.params.jd).select(`_id, lastName, ${req.params.id}`)// {assetType:mongoose.Types.ObjectId(req.params.id)}, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec(); //.where('userAsset').ne(null)
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
