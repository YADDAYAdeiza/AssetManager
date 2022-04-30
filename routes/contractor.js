let express = require('express');
let route = express.Router();
let ejs = require('ejs');
let layout = require('express-ejs-layouts');

let contractorModel = require('../models/contractor');
const path = require('path');
const multer = require('multer');

const upload = multer({
    dest:path.join('public', contractorModel.contractorDocument)
})
//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);



//get all assets

// route.get('/serial', async (req, res)=>{
//     console.log(req.query.selAssType);

//    var da =  await assetTypeModel.find({}).where('assetClass').equals(req.query.selAssType);
//    console.log(da);
//     res.json({'done': da[da.length-1].assetTypeCode});
// })

route.get('/index', async (req, res)=>{
    //  res.send('List all contractors...')
    let contractorModelArr = await contractorModel.find({});
    console.log(contractorModelArr);
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
   console.log(contractorArr);

    //res.render('AssetType/new.ejs', {assetType: new assetTypeModel()}); //tying the view to the moongoose model
    res.render('Contractor/new.ejs', {contractor: contractorArr}); //tying the view to the moongoose model
})

//create new book
route.post('/',  upload.single('contractorDocs'), async (req,res)=>{

   //res.send('Contractor form');
    // console.log(req.body);
   const fileName =  req.file.filename != null? req.file.filename : null;
    try{
       var contractor = await contractorModel.create({
        contractorCompanyName: req.body.contractorCompanyName,
        contractorAddress: req.body.contractorAddress,
        contractDocs: fileName
    })
    res.redirect('contractor/index');
    } catch(e){
        console.log(e.message);
    }
//    res.send('List of AssetTypes');
    
})


module.exports = route;
