let express = require('express');
let route = express.Router();
let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let assetTypeModel = require('../models/assetType');

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
    // res.send('Book stuff...')
    var assetTypes = await assetTypeModel.find({});
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

    //res.render('AssetType/new.ejs', {assetType: new assetTypeModel()}); //tying the view to the moongoose model
    res.render('AssetType/new.ejs', {assetType: assetTypesArr}); //tying the view to the moongoose model
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
        
        saveAssetImageDetails(asset, req.body.photo);
        
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

    var assetType = new assetTypeModel({
        assetTypeCode: req.body.assetNumber,
        assetTypeClass:req.body.assetTypeName,
    });

    saveAssetTypeImageDetails(assetType, req.body.assetTypePic)
    try{
       var newAssetType = await assetType.save();
    } catch(e){
       console.error(e);
    }
//    res.send('List of AssetTypes');
    
})



function saveAssetTypeImageDetails(assetType, encodedProfile){
    if (encodedProfile == null) return
    
    const profile = JSON.parse(encodedProfile);
    if (profile !=null && imageMimeTypes.includes(profile.type)){
        assetType.assetTypeImageName = new Buffer.from(profile.data, 'base64');
        assetType.assetTypeImageType = profile.type;
    }

}


module.exports = route;
