let express = require('express');
let route = express.Router();

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
const assetModel = require('../models/asset.js');
const { reset } = require('nodemon');
const { rawListeners } = require('../models/assetType.js');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];



//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


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
    try{
        let user = new userModel();
        let assetTypeModelArr = await assetTypeModel.find({});
        res.render('user/new.ejs', {user: user, assetTypeArr:[1,2,3,4,5]}); //tying the view to the moongoose model

    }catch (e){
        // console.log(e);
    }
    // console.log('-------');
    // console.log(assetTypeModelArr);
})


route.get('/:id/edit',  async (req,res)=>{
    console.log('Editing...');
    try{
        let userModelArr = await userModel.findById(req.params.id);
        let assetTypeModelArr = await assetTypeModel.find({});
        res.render('user/edit.ejs',{user: userModelArr, assetTypeArr:assetTypeModelArr}); //tying the view to the moongoose model //, 

    } catch (e){

        res.redirect('/user/index')
    }
    // let user = new userModel();
})

route.get('/:id', async (req, res)=>{
    // res.send('Getting the User Page...'+req.params.id);
    try {
       const user =await userModel.findById(req.params.id);
       const asset = await assetModel.find({user:user.id}).limit(6).exec();
       const allAsset = await assetModel.find().limit(20).exec();
       console.log("----");
       allAsset.forEach(asset=>{
           console.log(asset.assetCode);
       })
       res.render('user/show', {
           user:user,
           assetsByUser:asset,
           allAssets:allAsset
       });

    }catch (e){
        console.log(e);
        res.redirect('/index')
    }
});


route.put('/:id', async (req,res)=>{
    let user;

    try {
        let user = await userModel.find(req.params.id);
        
        user.lastName = req.body.lastName;
        user.firstName = req.body.firstName;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.username = req.body.username;
        user.password = req.body.password;
        user.assetType = req.body.assetTypeName;
        // user.asset = "0012"; //we're later getting asset from the form
        
        saveProfilePic(user, req.body.photo);
        
        await user.save();
    
        res.redirect("/user/${user.id}");
        // req.user = user;
        // userVar = user;
    } catch(e){
        if (author == null){
            res.redirect('/user')
        }else{
            res.render('user/edit.ejs', {msg:"An error updating the user occurred", user: user})
        }
        
    }
});

route.delete('/:id', async(req,res)=>{

    let user;
    
    try {
        let user = await userModel.findById(req.params.id);
        // console.log(user);
        await user.remove();
        
        // saveProfilePic(user, req.body.photo);
        console.log('Passed Here')
        // await user.save();
        res.redirect("/user/index");
        // req.user = user;
        // userVar = user;
    } catch(e){
        if (user == null){
            console.log('Entered here');
            res.redirect('/user/index');
        }else{
            res.redirect(`/user/${user.id}`)
        }
    }
});

//create new user
route.post('/',   async (req,res)=>{
  //  var fileName = req.file !=null ? req.file.filename:null;

    //const fileName = req.file.filename;//req.file != null ? req.file.filename : null;

    const user = new userModel({ //we're later getting asset from the form
        lastName:req.body.lastName,
        firstName:req.body.firstName,
        email:req.body.email,
        phone:req.body.phone,
        username:req.body.username,
        password:req.body.password,
        assetType:req.body.assetTypeName
        // asset:"0012"
    });

    saveProfilePic(user, req.body.photo);


    try {

        const newUser = await user.save()
        // res.redirect("/user/index");
        res.redirect(`/user/${newUser.id}`);
        req.user = user;
        userVar =user;
    } catch(e){
        console.log(e);
        res.render('user/new.ejs', {msg:"An error occured in posting to the database", user: user})
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
