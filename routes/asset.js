let express = require('express');
let route = express.Router();

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');

let assetModel = require('../models/asset.js');
let assetTypeModel = require('../models/assetType.js');
// const { rawListeners } = require('../models/asset.js');
const userModel = require('../models/user.js');
//route.set('layout', 'layouts/layout');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];


route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


let userVar = 'trial';
//get all assets
route.get('/index', async (req, res)=>{
    // res.send('Book stuff...');
   let assetModelVar = await assetModel.find({});
    res.render('./asset/index.ejs', {asset:assetModelVar, searchOptions:"my name"});
})

//get the create new form for new asset
route.get('/trial', (req, res)=>{
    console.log('This is asset: ', req.query.asset);
    res.render('asset/trial', {asset:req.query.asset, lngLat: req.query.lngLat});//
})

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
    console.log("+++++++++++++++++++++++++++++++")
    assetTypeModelVar.forEach((item)=>{
        console.log(item.assetTypeClass)
    });
    renderNewPage(res, new assetModel(), assetTypeModelVar, 'new');
})

async function renderNewPage(res, asset,assetTypeModelVar, hasError = false){
    renderFormPage(res, asset, assetTypeModelVar, 'new', hasError)
}

async function renderEditPage(res, asset, assetTypeModelVar, hasError=false){
    console.log('Entered here...')
    renderFormPage(res, asset, assetTypeModelVar, 'edit', hasError)
}

async function renderFormPage(res, asset, assetTypeModelVar, form, hasError = false){
    console.log('-----');
    try{
        const user = await userModel.find({});
        const params = {
            user:user,
            asset:asset
        }
        if (form === "edit"){
            params.assetTypeArr = assetTypeModelVar
        }else{
            params.assetType = assetTypeModelVar
        }

        if (hasError){
            if (form === "edit"){
                params.errorMessage = "Error Updating Asset"
            }else {
                params.errorMessage = "Error Creating Asset"
            }
        }
        res.render(`asset/${form}`, params);
    }catch(e){
        console.log(e);
        res.redirect('/asset/index');
    }
}


route.get('/:id', async (req, res)=>{
    try {
        const asset = await assetModel.findById(req.params.id).populate('assetType').exec();
        res.render('asset/show', {
            asset:asset
        });
 
     }catch (e){
         console.log(e);
         res.redirect('/index')
     }
})

route.get('/:id/edit', async(req, res)=>{

    try{
        const asset = await assetModel.findById(req.params.id);
        const assetTypeModeVar = await assetTypeModel.find({});
        renderEditPage(res, asset, assetTypeModeVar)
    }catch (e){
        res.redirect('/')
    }

    // res.send('Editing user with id: '+ req.params.id);
    // console.log('Editing...');
    // try{
    //     let assetModelArr = await assetModel.findById(req.params.id);
    //     let assetTypeModelArr = await assetTypeModel.find({});
    //     res.render('asset/edit.ejs',{asset: assetModelArr, assetTypeArr:assetTypeModelArr}); //tying the view to the moongoose model //, 

    // } catch (e){

    //     res.redirect('/asset/index')
    // }
    // // let user = new userModel();
})

route.put('/:id', async(req,res)=>{
    let user;

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

    try {
        let asset = await assetModel.find(req.params.id);
        
        asset.assetCode = req.body.assetCode;
        asset.assetType = req.body.assetType;
        asset.Status = req.body.Status;
        asset.description = req.body.description;
        asset.assignDate = new Date(req.body.assignDate);
        asset.user = req.body.user;
        asset.assetDescription = req.body.assetDescription;
        // user.asset = "0012"; //we're later getting asset from the form
        if (req.body.assetPic != null && req.body.assetPic !== ""){
            saveAssetImageDetails(asset, req.body.photo);
        }
        
        await asset.save();
        res.redirect("/asset/${asset.id}");
    } catch(e){
        if (author !=null){
            renderEditPage(res, author, assetTypeModelVar, true );
        }else{
            res.redirect('/asset/index')
        }
    }
})

//Delete Asset Page
route.delete('/:id', async (req, res)=>{
    let asset;
    
    try {
        asset = await assetModel.findById(req.params.id);
        await asset.remove();
        
        res.redirect("/asset/index");
    } catch(e){
        if (asset != null){
            res.render('/asset/show', {asset:asset, errorMessage:'Could not remove asset'});
        }else{
            res.redirect(`/asset/index`)
        }
    }
})

//create new asset
route.post('/', async (req,res)=>{
    
    var assetItem = new assetModel({
        assetType: req.body.selAssetType
    })

    saveAssetImageDetails(assetItem, req.body.assetPic);
    
    try{
        var newAsset = await assetItem.save();
        res.redirect('asset/index');
    }catch (e){
        console.log(e);
    }
})


function saveAssetImageDetails(user, encodedProfile){
    if (encodedProfile == null) return
    
    const profile = JSON.parse(encodedProfile);
    console.log('-----------');
    console.log(profile.type);
    if (profile !=null && imageMimeTypes.includes(profile.type)){
        user.assetImageName = new Buffer.from(profile.data, 'base64');
        user.assetImageType = profile.type; 
    }
}


module.exports = route;
