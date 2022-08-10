let express = require('express');
let route = express.Router();
let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let assetTypeModel = require('../models/assetType');
let {v4:uuidv4} = require('uuid');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];


//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


let userVar = 'trial';
//get all assets

route.get('/serial', async (req, res)=>{

   var da =  await assetTypeModel.find({}).where('assetClass').equals(req.query.selAssType);
    res.json({'done': da[da.length-1].assetTypeCode});
})
route.get('/index', async (req, res)=>{
    console.log('Listing assets now...')
    // let query = assetTypeModel.find();
    indexRedirect(req, res, 'Searching Asset Types', 'noError');
    // var assetTypes = await assetTypeModel.find({});
    // res.render('assetType/index.ejs', {assetTypes:assetTypes});
})

route.get('/index/justJson', async (req, res)=>{
    // res.send('Book stuff...')
    var assetTypes = await assetTypeModel.find({}, "assetTypeClass");

    // var assetTypes2 = assetTypes.map(arrItem=>{
    //     delete arrItem.assetTypeImageType;
    //     delete arrItem.assetTypeImageName;
    // })
    res.send({assetTypes});
})

//get the create new form for new book
route.get('/new', async (req,res)=>{
    console.log('New Form')
    // res.send('What item now');
    // res.send('Asset form');
   // res.render('./asset/new.ejs', {asset:assetModel});
   const assetTypes = await assetTypeModel.find({});
   const assetTypesArr = await assetTypeModel.find().distinct('assetTypeClass');
//    assetTypesArr.sort((a,b)=>{
//         if (a.assetTypeClass > b.assetTypeClass){
//             return 1
//         }

//         if (a.assetTypeClass < b.assetTypeClass){
//             return -1
//         }

//         return 0;
//    });

//    let assetTypesArrUnique = assetTypesArr.filter((val, itemIndex, self)=>{
//     if (self.indexOf(val.assetTypeClass) == itemIndex){
//         return 
//     }
//    });

    //res.render('AssetType/new.ejs', {assetType: new assetTypeModel()}); //tying the view to the moongoose model
    console.log('These are the distinct arrays: ', assetTypesArr);
    console.log('This is serialNo.:', uuidv4());
    res.render('AssetType/new.ejs', {assetType:assetTypes, assetTypesArr:assetTypesArr, serialNo:uuidv4()}); //tying the view to the moongoose model
})

route.get("/:id", async (req, res)=>{
    // res.send('Getting assetType of particular id '+req.params.id);

    let assetType=[];
    try{
        assetType = await assetTypeModel.findById(req.params.id);
        res.render('assetType/show.ejs', {assetType:assetType});
    }catch{
        res.render('assetType/index.ejs', {assetTypes:assetType, msg:'Error Showing Asset Type'})
    }

})

route.get("/:id/edit", async (req, res)=>{
    // res.send('Editing AssetType with id: '+req.params.id);
    try{
        let newAssetType = await assetTypeModel.findById(req.params.id);
        res.render('assetType/edit.ejs',{assetType:newAssetType}); //tying the view to the moongoose model //, 

    } catch (e){
        console.log(e);
        res.redirect('/assetType/index')
    }
})

route.put('/:id', async(req, res)=>{
    // res.send('updating AssetType with id: '+ req.params.id);

    try {
        let assetType = await assetTypeModel.findById(req.params.id);
        
        assetType.assetTypeCode = req.body.assetCode;
        assetType.assetTypeClass = req.body.assetType;
        assetType.Status = req.body.Status;
        assetType.description = req.body.description;
        assetType.assignDate = req.body.assignDate;
        assetType.user = req.body.user;
        assetType.assetDescription = req.body.assetDescription;
        // user.asset = "0012"; //we're later getting asset from the form
        
        saveAssetImageDetails(asset, req.body.assetTypePic);
        
        await assetType.save();
    
        res.redirect("/assetType/${assetType.id}");
    } catch(e){
        if (author == null){
            res.redirect('/assetType')
        }else{
            res.render('assetType/edit.ejs', {msg:"An error updating the asset type occurred", assetType: assetType})
        }
        
    }
})

route.delete('/:id', async (req, res)=>{
    
    try {
        let assetType = await assetTypeModel.findById(req.params.id);
        await assetType.remove();
        
        console.log('Passed Here')
        res.redirect("/assetType/index");
    } catch(e){
        if (user == null){
            res.redirect('/assetType/index');
        }else{
            res.redirect(`/assetType/${assetType.id}`)
        }
    }
})

//create new book
route.post('/',  async (req,res)=>{

    var assetTypes = await assetTypeModel.find({});
    
    var assetType = new assetTypeModel({
        assetTypeCode: req.body.assetNumber,
        assetTypeClass:req.body.assetTypeName,
        assetManufacturer:req.body.assetManufacturerName,
        assetPurchased:req.body.assetPurchased,
        assetStoreLocation:req.body.assetStoreLocation,
        assetValue:req.body.assetValue,
        assetQty:req.body.assetQty,
        assetLifeCycle:req.body.assetLifeCycle,
        status:req.body.assetStatus,
        assetDescription:req.body.assetDescription

    });

    saveAssetTypeImageDetails(assetType, req.body.assetTypePic);
    console.log('Name of photo2 ', req.body.assetTypePic);
    // indexRedirect(req, res, 'Searching Asset Types', 'noError');
    res.render('./assetType/index', {assetTypes:[assetType]});
    try{
       var newAssetType = await assetType.save();
    } catch(e){
       console.error(e);
    }
//    res.send('List of AssetTypes');
    
})

                        async function indexRedirect(req, res, msg, msgClass){
                            console.log('Entered listing assets...');
                            let query = assetTypeModel.find();
                            if (req.query.assetTypeNameSearch != null && req.query.assetTypeNameSearch != ""){
                                query = query.regex('assetTypeClass', new RegExp(req.query.assetTypeNameSearch, 'i'));
                            }
                            if (req.query.assetTypeDateAfterSearch != null && req.query.assetTypeDateAfterSearch != ""){
                                query = query.gte('assetPurchased', req.query.assetTypeDateAfterSearch);
                            }
                            if (req.query.assetTypeDateBeforeSearch != null && req.query.assetTypeDateBeforeSearch != ""){
                                query = query.lte('assetPurchased', req.query.assetTypeDateBeforeSearch);
                            }

                            //might this be necessary for assets at all?
                            console.log('This is message:', msg);
                            if (msg == 'My Profile(s)'){
                                console.log('=%')
                                query = query.where('_id', req.user.profileId); //work on this
                            }

                            try{
                                const assetTypes = await query.exec()
                                console.log('---');
                                console.log('These are assets Types:');
                                // console.log(assetTypes);
                                res.render('./assetType/index.ejs', {
                                    assetTypes:assetTypes,
                                    searchParams:req.query,
                                    msg,
                                    msgClass
                                }); //tying the view to the moongoose model
                                
                            }catch {
                                res.render('assetType/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                            }
                            //msg:"error goes in here",
                        }



function saveAssetTypeImageDetails(assetType, encodedProfile){
    if (encodedProfile == null) return
    
    // const profile = JSON.parse(encodedProfile);
        // assetType.assetTypeImageName = new Buffer.from(profile.data, 'base64');
        // assetType.assetTypeImageType = profile.type;
        console.log('This is the name of photo', encodedProfile);
        assetType.assetTypeImageName = encodedProfile;
        assetType.assetTypeImageType = 'An Image';
    

}


module.exports = route;
