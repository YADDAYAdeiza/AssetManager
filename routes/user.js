let express = require('express');
let route = express.Router();

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
const assetModel = require('../models/asset.js');
const { rawListeners } = require('../models/assetType.js');
const { response } = require('express');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];



//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


let userVar = 'trial';
//get all users of assets
route.get('/index', async (req, res)=>{
    
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
            msg: `Listed fine`,
            msgClass:'noError'
        }); //tying the view to the moongoose model
        
    }catch {
        res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
    }
    //msg:"error goes in here", 
})

//get the create new form for user
route.get('/new',  async (req,res)=>{
    // res.send('What item now');
    let user = new userModel();
    let msg = {
        message:'Input profile details',
        class:'green'
    }
    renderNewPage(res, user, msg)
})

async function renderNewPage(res, user, msg){
    try{
        let assetTypeModelArr = await assetTypeModel.find({});
        res.render('user/new.ejs', {user: user, assetTypeArr:[1,2,3,4,5], msg:msg}); //tying the view to the moongoose model

    }catch (e){
        //list of users
        res.redirect('/index');
    }
}


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
    var ownAssets=[];
    try {
       const user =await userModel.findById(req.params.id);
       const asset = await assetModel.find({user:user.id}).limit(6).exec();
       const allAsset = await assetModel.find();
       
       user.userAsset.id.forEach(async itemArr=>{
            itemArr.forEach(async item=>{
                ownAssets.push(item);
            })
        });

        const records = await assetModel.find().where('_id').in(ownAssets).select('assetCode assetType status').exec();
        console.log(records);
       res.render('user/show', {
           user:user,
           assetsByUser:asset,
           allAssets:allAsset,
           ownAssets:records
       });

    }catch (e){
        console.log(e);
        res.redirect('/index')
    }
});


route.put('/:id', async (req,res)=>{
    let user;
    let allAsset;
    let newIdArr = [];
    let msg = {};
    console.log(req.method);
    console.log(req.params.id);
    let userAssetArr = JSON.parse(req.params.id);
    
    try{
        user = await userModel.findById(userAssetArr.userId); //, 'firstName lastName cadre userAsset'
        allAsset = await assetModel.find();
        userAssetArr.idArr.forEach(assetId=>{
            console.log(assetId);
            newIdArr.push(assetId)
        })
        user.userAsset.id.push(newIdArr);
        user.save();
        msg = {
            message:'User Asset updated!',
            class:'green'
        };

        //getting all user assets with user.userAsset.id
        // user.userAsset.id.forEach(itemArr=>{
        //     itemArr.forEach(item=>{

        //     })
        // });

        res.render('user/show', {
            user:user,
            assetsByUser:[],
            allAssets:allAsset,
            ownAssets:[],
            msg
        });
    } catch(e){
        console.log(e.message);

    }
});

route.delete('/:id', async(req,res)=>{
    let user;
    try {
        let user = await userModel.findById(req.params.id);
        await user.remove();
        console.log('Passed Here')
        res.redirect("/user/index");
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
    const user = new userModel({ //we're later getting asset from the form
        lastName:req.body.lastName,
        firstName:req.body.firstName,
        email:req.body.email,
        state:JSON.parse(req.body.state).state,
        geoCoord:JSON.stringify(JSON.parse(req.body.state).latLng),
        date:req.body.createdAt,
        phone:req.body.phone,
        cadre:req.body.cadre,
        rank:req.body.rank,
        assetType:req.body.assetTypeName
    });

    let emailExist = await userModel.exists({email:req.body.email});
    try {
        if (emailExist){
            throw 'email exists'
        }else {
            console.log('_____*******___________');
            console.log('This is phtoto ', req.body.photo);
            if (req.body.photo){
                saveProfilePic(user, req.body.photo);
            }
        
            try {
                const newUser = await user.save()
                // res.redirect("/user/index");
                res.redirect(`/user/${newUser.id}`);
                req.user = user;
                userVar =user;
            } catch(e){
                //email already exists
                console.log(e);
                let msg = {
                    message:'An error occured creating profile',
                    class:'red'
                }
                renderNewPage(res, user);
                //or use this below -proven
                // res.render('user/new.ejs', {msg:"An error occured in posting to the database", user: user})
            }
        }
        
    }catch (e) {
        console.error(e);
        let msg = {
            message:'email already exists',
            class:'red'
        }
        renderNewPage(res, user, msg);
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
