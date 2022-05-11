let express = require('express');
let route = express.Router();

let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
// let fs = require('fs');
// const path = require('path');
// const { use } = require('./recent');
//const multer = require('multer');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// const uploadPath = path.join('public', userModel.profileImagePath);

// const upload = multer({
//     dest: uploadPath, 
//     // fileFilter: (req, file, callback)=>{
//     //     callback(null, imageMimeTypes.includes(file.mimeType))
//     // }
// })

//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);


let userVar = 'trial';
//get all users of assets
route.get('/index', async (req, res)=>{
    // res.send('From user route')
    //res.render('userform.ejs');
    let query = userModel.find();
    if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
        query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
    }
    if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
        query = query.lte('dateCreated', req.query.userDateBeforeSearch);
    }
    if (req.query.afterDateBeforeSearch != null && req.query.afterDateBeforeSearch != ""){
        query = query.gte('dateCreated', req.query.afterDateBeforeSearch);
    }

    try{
        const users = await query.exec()
        var para = {
            users:users,
            searchParams:req.query,
            msg: `An error occured`
        }
        res.render('user/index.ejs', {
            users:users,
            searchParams:req.query,
            msg: `An error occured`
        }); //tying the view to the moongoose model
        
    }catch {
        
        res.render('user/index.ejs', {msg: `An error occurred`}); //tying the view to the moongoose model
    }
    //msg:"error goes in here", 
})

//get the create new form for user
route.get('/new',  async (req,res)=>{
    // res.send('What item now');
    let assetTypeModelArr = await assetTypeModel.find({});
    let user = new userModel();
    res.render('user/new.ejs', {user: user, assetTypeArr:assetTypeModelArr}); //tying the view to the moongoose model
})

//create new user
route.post('/',   async (req,res)=>{
  //  var fileName = req.file !=null ? req.file.filename:null;

    //const fileName = req.file.filename;//req.file != null ? req.file.filename : null;

    const user = new userModel({
        lastName:req.body.lastName,
        firstName:req.body.firstName,
        email:req.body.email,
        phone:req.body.phone,
        username:req.body.username,
        password:req.body.password,
        assetType:req.body.assetTypeName
    });

    saveProfilePic(user, req.body.photo);


    try {

        const newUser = await user.save()
        res.redirect("/user/index");
        res.redirect("./user/${newUser.id}")
        req.user = user;
        userVar =user;
    } catch(e){
        
        res.render('user/new.ejs', {msg:"An error occured in updating the database", user: user})
    }
    
})

route.get('/audit', (req, res)=>{
res.render('./user/audit.ejs')
})

route.get('/audit2', (req, res)=>{
    res.render('./user/audit2.ejs')
    })



function saveProfilePic(user, encodedProfile){
    if (encodedProfile == null) return

    const profile = JSON.parse(encodedProfile);
    if (profile !=null && imageMimeTypes.includes(profile.type)){
        user.profilePic = new Buffer.from(profile.data, 'base64');
        user.profilePicType = profile.type;
    }

}




module.exports = route;
