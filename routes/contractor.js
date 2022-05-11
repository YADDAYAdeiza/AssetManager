let express = require('express');
let route = express.Router();
let ejs = require('ejs');
let layout = require('express-ejs-layouts');

let contractorModel = require('../models/contractor');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];


//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);



//get all assets

// route.get('/serial', async (req, res)=>{

//    var da =  await assetTypeModel.find({}).where('assetClass').equals(req.query.selAssType);
//     res.json({'done': da[da.length-1].assetTypeCode});
// })

route.get('/index', async (req, res)=>{
    //  res.send('List all contractors...')
    let contractorModelArr = await contractorModel.find({});
    res.render('contractor/index.ejs', {contractor: contractorModelArr});
})

//get the create new form for new book
route.get('/new', async (req,res)=>{
    // res.send('Form for new contractor');
    // res.send('Asset form');
   // res.render('./asset/new.ejs', {asset:assetModel});
   const contractorArr = await contractorModel.find({});
   contractorArr.sort((a,b)=>{
        if (a.contractorClass > b.contractorClass){
            return 1
        }

        if (a.contractorClass < b.contractorClass){
            return -1
        }

        return 0;
   });

    //res.render('AssetType/new.ejs', {assetType: new assetTypeModel()}); //tying the view to the moongoose model
    res.render('Contractor/new.ejs', {contractor: contractorArr}); //tying the view to the moongoose model
})

//create new book
route.post('/', async (req,res)=>{

   //res.send('Contractor form');
   var contractor = contractorModel({
    contractorCompanyName: req.body.contractorCompanyName,
    contractorAddress: req.body.contractorAddress,
})
contractormageDetails(contractor, req.body.contractorDocs);
    try{
        var newContractor = await contractor.save();
    res.redirect('contractor/index');
    } catch(e){
        console.error(e.message);
    }
//    res.send('List of AssetTypes');
    
})

function contractormageDetails(contractor, encodedProfile){
    if (encodedProfile == null) return
    
    const profile = JSON.parse(encodedProfile);
    if (profile !=null && imageMimeTypes.includes(profile.type)){
        contractor.contractImageName = new Buffer.from(profile.data, 'base64');
        contractor.contractImageType = profile.type;
    }

}


module.exports = route;
