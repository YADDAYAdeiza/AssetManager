let express = require('express');
let route = express.Router();

let ejs = require('ejs');
let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType');
let fs = require('fs');
const path = require('path');
const multer = require('multer');
const imageMimeTypes = ['images/jpeg', 'images/png', 'images/gif'];

const uploadPath = path.join('public', userModel.profileImagePath);

console.log('+++++++++++');
console.log(userModel.profileImagePath);
const upload = multer({
    dest: uploadPath, 
    // fileFilter: (req, file, callback)=>{
    //     callback(null, imageMimeTypes.includes(file))
    // }
})

//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

route.use(layout);


let userVar = 'trial';
//get all users of assets
route.get('/index', async (req, res)=>{
    // res.send('From user route')
    //res.render('userform.ejs');
    console.log('In index')
    console.log(userVar);

    try{
        const users = await userModel.find({})
        console.log('******')
        // console.log(users);
        res.render('user/index.ejs', {msg: `${userVar.firstName} added`, users: users}); //tying the view to the moongoose model
        
    }catch {
        
        res.render('user/index.ejs', {msg: `An error occurred`}); //tying the view to the moongoose model
    }
    //msg:"error goes in here", 
})

//get the create new form for user
route.get('/new',  async (req,res)=>{
    // res.send('What item now');
    let assetTypeModelArr = await assetTypeModel.find({});
    console.log('AssetTypes...')
    console.log(assetTypeModelArr);
    let user = new userModel();
    res.render('user/new.ejs', {user: user, assetTypeArr:assetTypeModelArr}); //tying the view to the moongoose model
})

//create new user
route.post('/',  upload.single('photo'), async (req,res)=>{
    console.log(req.file);
  //  var fileName = req.file !=null ? req.file.filename:null;

    console.log('This is profile filename, ',req.file.filename);
    const fileName = req.file.filename;//req.file != null ? req.file.filename : null;
    console.log('Entered here');
    console.log(req.body);

    const user = new userModel({
        lastName:req.body.lastName,
        firstName:req.body.firstName,
        email:req.body.email,
        phone:req.body.phone,
        username:req.body.username,
        password:req.body.password,
        profilePic: fileName,
        assetType:req.body.assetTypeName
    });

    try {

        const newUser = await user.save()
        res.redirect("/user/index");
        res.redirect("./user/${newUser.id}")
        req.user = user;
        userVar =user;
        console.log('------')
        console.log(userVar)
    } catch(e){
        console.log(e.message);
        if (newUser.removeProfilePic != null){
            removeProfilePic(newUser.profilePic);
        }
        res.render('user/new.ejs', {msg:"An error occured in updating the database", user: user})
    }
    
})

route.get('/audit', (req, res)=>{
res.render('./user/audit.ejs')
})

route.get('/audit2', (req, res)=>{
    res.render('./user/audit2.ejs')
    })

function removeProfilePic(profilePicName){
fs.unlink(path.join(uploadPath, profilePicName), err=>{
    if (err) console.error(err)
})
}




module.exports = route;
