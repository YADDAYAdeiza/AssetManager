let express = require('express');
let route = express.Router();

let mongoose = require('mongoose');

let ejs = require('ejs');
let {v4:uuidv4} = require('uuid');

// let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
const assetModel = require('../models/asset.js');
// const { reset } = require('nodemon');
// const { rawListeners } = require('../models/assetType.js');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];



//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


// let userVar = 'trial';
//get all users of assets

route.get('/trackFleet', async (req, res)=>{
    console.log('Tracking Fleet...');
    // let trackedFleet =  await assetModel.find({}).where('assetTracked').equals(true).populate('assetType');
    trackableAssetType = await assetTypeModel.find({}).where('assetTypeTrackable').equals(true);
    console.log('This is array ',trackableAssetType);
    trackedFleet = await assetModel.find({}).populate({path:'assetType', select:'assetTypeTrackable', match:{assetTypeTrackable:true}}).where('assetType').in(trackableAssetType).where('assetTracked').equals(true).populate('assetLocationHistory', 'firstName geoCoord').select('assetCode assetType assetName assetTrackable assetTracked assetLocationHistory firstName');
    console.log(trackedFleet);
    res.send(JSON.stringify(trackedFleet));
})

route.get('/mapping/:mapItem', async (req, res)=>{  
    let response;
    let trackableAssetType; //to bring out worthy assetTypes
    try{
        if (req.params.mapItem == 'user'){
           response = await userModel.find({}).select('firstName lastName state geoCoord directorate zone');
           responseDistinct = await userModel.find({}).distinct('directorate');
        }
        
        if (req.params.mapItem == 'asset'){
            trackableAssetType = await assetTypeModel.find({}).where('assetTypeTrackable').equals(true);
            trackableAssetTypeDistinct = await assetTypeModel.find({}).where('assetTypeTrackable').equals(true).distinct('assetTypeClass');
            console.log('This is array ', trackableAssetTypeDistinct);
            response = await assetModel.find({}).populate({path:'assetType', select:'assetTypeTrackable', match:{assetTypeTrackable:true}}).where('assetType').in(trackableAssetType).where('assetTracked').equals(true).populate('assetLocationHistory', 'firstName geoCoord').select('assetCode assetType assetName assetTrackable assetTracked assetLocationHistory firstName');
            responseDistinct = await assetModel.find({}).where('assetType').in(trackableAssetType).select('assetName').distinct('assetName');
                //but the below works too.
            // responseDistinct = await assetModel.find({}).where('assetName').in(trackableAssetTypeDistinct).select('assetName').distinct('assetName');
            console.log('This is response Distinct: ', responseDistinct);
            // responseDistinct = await assetModel.find({}).where('assetTypeClass').in(trackableAssetType).select('assetName').distinct('assetName');
        }
    
        if (req.params.mapItem == 'contractors'){
            //  response = await assetModel.find({}).where('assetTracked').equals(true).select('assetCode assetType assetName assetTracked');
        }
        res.json({resp:response, category:responseDistinct});
    }catch(e){
        console.log(e.message);
    }
})

route.get('/mapping/:mapItem/:subItem', async (req, res)=>{  
    // console.log('==');
    console.log('Hitting here second');
    // console.log('This is subItem: ', req.params.subItem);
    // console.log(req.params);
    let response;
    try{
        if (req.params.mapItem == 'user'){
           response = await userModel.find({}).where('directorate').equals(req.params.subItem).select('firstName lastName state geoCoord directorate zone');
        //    responseDistinct = await userModel.find({}).distinct('directorate');
        }
        
        if (req.params.mapItem == 'asset'){
            // response = await assetModel.find({}).where('assetTrackable').equals(true).where('assetTracked').equals(true).where('assetName').equals(req.params.subItem).populate('assetLocationHistory', 'firstName geoCoord').select('assetCode assetType assetName assetTrackable assetTracked assetLocationHistory firstName');
            response = await assetModel.find({}).where('assetName').equals(req.params.subItem).populate('assetLocationHistory', 'firstName geoCoord').select('assetCode assetType assetName assetTrackable assetTracked assetLocationHistory firstName');
            // responseDistinct = await assetModel.find({}).where('assetTracked').equals(true).select('assetName').distinct('assetName');
        }
    
        if (req.params.mapItem == 'contractors'){
            //  response = await assetModel.find({}).where('assetTracked').equals(true).select('assetCode assetType assetName assetTracked');
        }
        res.json(response);
    }catch(e){
        console.log(e.message);
    }
})

route.get('/national', async (req, res)=>{
    try{
        let trackableAsset = await assetModel.find({}).where('assetTypeTrackable').equals('false');
        res.render('overview/national.ejs', {roomId:uuidv4(), trackableAsset});
    }catch (e){
        console.log(e.message);
    }
})


route.get('/metrics', async (req, res)=>{
    // let uniqueAssetModelItems = await assetTypeModel.find().distinct('assetTypeClass');
    let uniqueAssetModelItems = await assetTypeModel.find({}, '_id, assetTypeClass').exec();
    let uniqueStates = await userModel.find({}, '_id, state').distinct('state').exec();
    let uniqueCadres = await userModel.find({}, '_id, cadre').distinct('cadre').exec();
    let uniqueDirectorates = await userModel.find({}, '_id, directorate').distinct('directorate').exec();
    let uniqueZones = await userModel.find({}, '_id, zone').distinct('zone').exec();
    console.log(uniqueAssetModelItems);
    console.log(uniqueStates);
    res.render('overview/metrics.ejs', {uniqueAssetModelItems, uniqueStates, uniqueCadres, uniqueDirectorates, uniqueZones});
})



route.get('/:id/metrics', async(req, res)=>{
    console.log('Metric: this is overview ', req.params.id)
    console.log('Using req.query', req.query);
    // const asset = await assetModel.find({id:mongoose.Types.ObjectId(req.params.id)}, 'assetCode, assetType').exec();
    try{
        var assetLength =  (await assetModel.find()).length;
        var assetAssigned =  (await assetModel.find().where('allocationStatus').equals(true).populate('assetType', 'assetTypeClass').select('assetType status assetTypeClass'));
        var assetAssignedLength = assetAssigned.length;
        console.log('Affected Assets');
        console.log(assetAssignedLength);
        console.log('Assets are: ', assetAssigned);
        var requisition =  (await userModel.find().where('userRequisition').ne(null).select('userRequisition'));//.length
        var requisitionLength = requisition.length;
        if (req.params.id =='none'){
            var asset = [];
        }else if (req.params.id =='all'){
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
        
        
            //simplifying assetAssigned, to take just an array of objects and their numbers
            var assetAssignedTrimmedObj = {};
            var requisitionTrimmedObj = {};
            assetAssigned.forEach(arrItem=>{
                assetAssignedTrimmedObj [arrItem.assetType.assetTypeClass] = 0;
            })

            assetAssigned.forEach(arrItem=>{
                ++assetAssignedTrimmedObj [arrItem.assetType.assetTypeClass];
            })
        
        
             //simplifying requisition
            requisition.forEach(arrItem=>{
                Object.keys(arrItem.userRequisition).forEach(reqItem=>{
                    requisitionTrimmedObj[reqItem] = 0;
                })
            });

            requisition.forEach(arrItem=>{
                Object.keys(arrItem.userRequisition).forEach(reqItem=>{
                    requisitionTrimmedObj[reqItem] += arrItem.userRequisition[reqItem];
                })
            })

        console.log('This is trimmed asset ', assetAssignedTrimmedObj);
        console.log('This is requisition', requisition);

        var assetObj = {
            asset,
            total:assetLength,
            requisition:requisitionLength,
            assetAssigned:assetAssignedLength,
            assetAssignedBrokenDown:assetAssignedTrimmedObj,
            requisitionBrokenDown:requisitionTrimmedObj
        }
        console.log('This is obj to be sent ', assetObj);
        res.send(JSON.stringify(assetObj));
    }catch (e){
        console.log(e);
    }
});

route.get('/:id/:jd/metricOther', async(req, res)=>{
    console.log('Metric: this is overview Other id ', req.params.id)
    console.log('Metric: this is overview Other jd', req.params.jd)
    console.log('assetSel.value is: ', req.query );
    if (req.query.first){
        var assetId = req.query.first.slice(req.query.first.indexOf('=')+1);//;
    }
    console.log(assetId);
    console.log('length ',assetId.length);
    console.log(typeof assetId);
    // const asset = await assetModel.find({id:mongoose.Types.ObjectId(req.params.id)}, 'assetCode, assetType').exec();
    try{
        let query = userModel.find();
        let user = await userModel.find().populate('userAsset.id').select('firstName lastName assetType');

        


            // query.where('userAsset.id').equals(assetId);
            // query = await query.find({'userAsset.id._id':'62c99ce72e55b5625a784d3a'}).exec();
            // query = query.find({'userAsset.id[assetName]':'Chair'});
            // query =  query.select('userAsset.id').where('assetName').equals('Chair');//mongoose.Types.ObjectId
            // query =  query.select('userAsset id').where('assetName').equals('Chair');//mongoose.Types.ObjectId
            // query =  query.where('userAsset.id[0].assetName').equals('Chair');//mongoose.Types.ObjectId
            // query = await query.find({'firstName':'Janga'}).exec();
        
            //use this for userAsset
            if (req.query.assetDepend){ //assetDepend corresponds with First: assetDepend is the text asset, first is the id.  assetDepend is not really used, only in this conditional as a check  
                console.log('There is asset...');
                if(req.query.assetDepend=='All'){
                    //do nothing
                }else{
                    // query =  query.where('userAsset.idType').equals(mongoose.Types.ObjectId(assetId));//mongoose.Types.ObjectId
                    query =  query.where('userAsset.idType').equals(assetId);//mongoose.Types.ObjectId
                }
    
            }
           
            //users with specific assets, with cadre and directorate, etc....
            console.log('Not All--');
            if(Object.keys(req.query).length > 1){
                if (req.query.cadreDepend){ //dependency
                    console.log('There is cadre...');
                    if (req.query.cadreDepend == 'All'){
                        query = query.where('cadre').ne(null).select(`_id, lastName, ${req.params.id}`);
                    }else{
                        query = query.where('cadre').equals(req.query.cadreDepend).select(`_id, lastName, ${req.params.id}`);
                    }
                }
                if (req.query.directorateDepend){ //dependency
                    console.log('There is directorate');
                    if (req.query.directorateDepend == 'All'){
                        query = query.where('directorate').ne(null).select(`_id, lastName, ${req.params.id}`);
                    }else{
                        query = query.where('directorate').equals(req.query.directorateDepend);
                    }
                }
                
                if (req.query.stateDepend){ //dependency
                    console.log('There is state');
                    if (req.query.stateDepend == 'All'){
                        query = query.where('state').ne(null).select(`_id, lastName, ${req.params.id}`);
                    }else{
                        query = query.where('state').equals(req.query.stateDepend);
                    }
                }
                if (req.query.zoneDepend){ //dependency
                    console.log('There is state');
                    if (req.query.zoneDepend == 'All'){
                        query = query.where('zone').ne(null).select(`_id, lastName, ${req.params.id}`);
                    }else{
                        query = query.where('zone').equals(req.query.zoneDepend);
                    }
                }
            }else{
                if (req.params.jd =='All'){
                    query = query.where(req.params.id).ne(null);
                }else{
                    query = query.where(req.params.id).equals(req.params.jd).select(`_id, lastName, ${req.params.id}`)// {assetType:mongoose.Types.ObjectId(req.params.id)}, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec(); //.where('userAsset').ne(null)
                }

            }
            // var asset = await userModel.find().where(req.params.id).equals(req.params.jd).select(`_id, lastName, ${req.params.id}`)// {assetType:mongoose.Types.ObjectId(req.params.id)}, 'assetCode assetType').populate('assetType', 'assetTypeClass').exec(); //.where('userAsset').ne(null)
            // console.log(asset);
      

        //if,req.query
        // let query = userModel.find();
        //                     if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
        //                         query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
        //                     }
        //                     if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
        //                         query = query.lte('dateCreated', req.query.userDateBeforeSearch);
        //                     }
        // res.send(JSON.stringify(asset));
        res.send(JSON.stringify(await query.exec()));
    }catch (e){
        console.log(e);
    }
});


route.get('/index', async (req, res)=>{
    res.send('overview index')
})



module.exports = route;
