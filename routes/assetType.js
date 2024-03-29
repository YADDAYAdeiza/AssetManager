let express = require('express');
let route = express.Router();
let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let assetTypeModel = require('../models/assetType');
let assetTypeAuditModel = require('../models/assetType_Audit');
let {v4:uuidv4} = require('uuid');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

let cors = require('cors');


//route.set('layout', 'layouts/layout');

route.use(express.static('public'));
// route.use(cors({
//     origin:true,

// }))

// route.use(cors({
//     origin:"*",
//     method:["GET", "POST", "PUT"],
//     allowedHeaders: "*",
//     exposedHeaders:"content-disposition"
//   }));
route.use(function(req,res,next) {
    // req.connection.setNoDelay(true)
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Origin", "https:127.0.0.1:2000"); 

    res.header('Access-Control-Expose-Headers', 'Content-Disposition');
    // res.header('Access-Control-Expose-Headers', 'agreementrequired');
  
    next()
})

//route.use('/user', userRoute);

// route.use(layout);


let userVar = 'trial';
//get all assets
route.get('get-file', (req, res)=>{
    console.log('Hitting here...');
});
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
   try {
        const assetTypes = await assetTypeModel.find({});
        const assetTypesArr = await assetTypeModel.find().distinct('assetTypeClass');
        console.log('Going fine');
        console.log('These are the distinct arrays: ', assetTypesArr);
        console.log('This is serialNo.:', uuidv4());
        res.render('assetType/new.ejs', {assetType:assetTypes, assetTypesArr:assetTypesArr, serialNo:uuidv4()}); //tying the view to the moongoose model
   }catch(e){
        console.log('An assetType error occured:')
        console.log(e.message);
        //res.render('AssetType/new.ejs', {assetType: new assetTypeModel()}); //tying the view to the moongoose model
   }
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
        let assetType = await assetTypeModel.findById(req.params.id);//
        let assetTypeArr = await assetTypeModel.find({}).distinct('assetTypeClass');
        let assetTypeManufacturerDistinct = await assetTypeModel.find({}).distinct('assetTypeManufacturer');

        //  console.log('This is the object to be edited, ',newAssetType)
        //  console.log('This is the object to be edited, ',assetTypeArr)

        res.render('assetType/edit2.ejs',{assetType, assetTypeArr, assetTypeManufacturerDistinct}); //tying the view to the moongoose model //, 

    } catch (e){
        console.error(e.message);
        res.redirect('/assetType/index')
    }
})

route.put('/:id', async(req, res)=>{
    // res.send('updating AssetType with id: '+ req.params.id);
    console.log('Id affected ', req.params.id);
    console.log('Id affected len ', req.params.id.length);

    try {
        let assetType = await assetTypeModel.findById(req.params.id).select('assetTypeClass assetTypeCode assetManufacturer assetPurchased');
        console.log(assetType);
        // console.log('------------------------------------');
        // console.log(assetType.assetPurchased);
        // console.log(assetType.assetPurchased.toLocaleDateString());
        // console.log(assetType.assetPurchased.toISOString().split('T')[0]);
        // console.log(assetType.assetPurchased.toString()).slice((assetType.assetPurchased.toString()).indexOf('T'));
        // console.log(typeof assetType.assetPurchased);
        
        assetType.assetTypeCode = req.body.assetTypeNumber,
        assetType.assetTypeClass = req.body.assetTypeName,
        assetType.assetTypeManufacturer = req.body.assetTypeManufacturerName,
        assetType.assetTypeManufacturerAddress = req.body.assetTypeManufacturerAddress,
        assetType.assetTypeManufacturerPhone = req.body.assetTypeManufacturerPhone,
        assetType.assetTypeManufacturerEmail = req.body.assetTypeManufacturerEmail,
        assetType.assetTypePurchased = req.body.assetTypePurchased,
        assetType.assetTypeStoreLocation = req.body.assetTypeStoreLocation,
        assetType.assetTypeValue = req.body.assetTypeValue,
        assetType.assetTypeQty = req.body.assetTypeQty,
        assetType.assetTypeLifeCycle = req.body.assetTypeLifeCycle,
        assetType.assetTypestatus = req.body.assetTypeStatus,
        assetType.assetTyp;eDescription = req.body.assetTypeDescription


        // assetType.assetTypeCode = req.body.assetTypeCode;
        // assetType.assetTypeClass = req.body.assetTypeClass;
        // assetType.status = req.body.status;
        // // assetType.assetDescription = req.body.description;
        // assetType.assetPurchased = req.body.assetPurchased;
        // //assetType.user = req.body.user;
        // assetType.assetDescription = req.body.assetDescription;
        // // user.asset = "0012"; //we're later getting asset from the form
        console.log('Got here');
        saveAssetTypeImageDetails(assetType, req.body.assetTypePic);
        console.log('Scaled here');
        await assetType.save();
        console.log('Saved');
    
        res.redirect("/assetType/${assetType.id}");
    } catch(e){
        // if (assetType == null){
            // res.redirect('/assetType');
        // }else{
            res.render('/assetType/edit.ejs', {msg:"An error updating the asset type occurred", assetType: assetType})
        // }
        
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
    console.log('Entered here');

    var assetTypes = await assetTypeModel.find({});
    var assetType = new assetTypeModel({
        assetTypeCode: req.body.assetTypeNumber,
        assetTypeClass:req.body.assetTypeName,
        assetTypeManufacturer:req.body.assetTypeManufacturerName,
        assetTypeManufacturerAddress:req.body.assetTypeManufacturerAddress,
        assetTypeManufacturerPhone:req.body.assetTypeManufacturerPhone,
        assetTypeManufacturerEmail:req.body.assetTypeManufacturerEmail,
        assetTypePurchased:req.body.assetTypePurchased,
        assetTypeStoreLocation:req.body.assetTypeStoreLocation,
        assetTypeValue:req.body.assetTypeValue,
        assetTypeQty:req.body.assetTypeQty,
        assetTypeLifeCycle:req.body.assetTypeLifeCycle,
        assetTypeStatus:req.body.assetTypeStatus,
        assetTypeTrackable:req.body.assetTypeTrackable,
        assetTypeDescription:req.body.assetTypeDescription

    });

    
    //
    
    saveAssetTypeImageDetails(assetType, req.body.assetTypePic);
    console.log('Name of photo2 ', req.body.assetTypePic);
    // indexRedirect(req, res, 'Searching Asset Types', 'noError');
    try{
        console.log('Saving...')
        var newAssetType = await assetType.save();
        var assetTypeAudit = new assetTypeAuditModel({
            assetType: newAssetType._id
        });
        await assetTypeAudit.save()
        res.render('./assetType/index', {assetTypes:[assetType]});

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
        console.log(encodedProfile.slice(encodedProfile.lastIndexOf('/')+1));
        assetType.assetTypeImageName = encodedProfile.slice(encodedProfile.lastIndexOf('/')+1);
        assetType.assetTypeImageType = 'An Image';
    

}


module.exports = route;
