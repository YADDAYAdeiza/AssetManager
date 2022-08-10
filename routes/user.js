let express = require('express');
let route = express.Router();
let mongoose = require('mongoose');

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
const assetModel = require('../models/asset.js');
const { rawListeners } = require('../models/assetType.js');
const { response } = require('express');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
let userLogModel = require('../models/userLog');
let userCredModel = require('../models/userCred');

//authentication
const {adminAuth} = require('../basicAuth');
// const { reset } = require('nodemon');

let multer = require('multer');
let upload = multer({dest:'uploads/', fileFilter:(req, file, callback)=>{
                        callback(null, imageMimeTypes.includes(file.mimetype))
                    }
                 });







//route.set('layout', 'layouts/layout');

route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


let userVar = 'trial';
//get all users of assets

route.get('/getHistory/:id', async (req,res)=>{
   let userHistory = await userLogModel.find().where('activity').in(['Requisition', 'Directorate Approval', 'Store Approval']).where('user').equals(mongoose.Types.ObjectId(req.params.id));
   
    res.json(userHistory);
})
//This is for determining if, straight from login success, to go to Register New User or User profile.
route.get('/showOrNew', (req, res)=>{ //admin middleware may be used here to grant full authorization
    console.log('In showOrNew=====================================');
    if (req.user.profileId.length){
        // res.send(req.user.profileId);
        // res.redirect(`/user/${req.user.profileId}`);
        indexRedirect(req, res, 'My Profile(s)', 'noError') 

    } else{
        res.redirect('/user/new');

    }
})

                        async function indexRedirect(req, res, msg, msgClass){
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

                            //coming from authorization ; things like this should be temporary and is to be fixed in authorization middleware?
                            //Rather than set admin to req.user.profileId, we'll set it to a wild card, that'll allow anything. 
                            console.log('This is message:', msg);
                            if (msg == 'My Profile(s)'){
                                console.log('=%')
                                query = query.where('_id', req.user.profileId); //work on this
                            }

                            try{
                                const users = await query.exec()
                                
                                res.render('user/index.ejs', {
                                    users:users,
                                    searchParams:req.query,
                                    msg,
                                    msgClass
                                }); //tying the view to the moongoose model
                                
                            }catch {
                                res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                            }
                            //msg:"error goes in here",
                        }
route.get('/index', async (req, res)=>{
    indexRedirect(req, res, 'Listed fine', 'noError') 
})

route.get('/other', async (req, res)=>{
    try{
        let users = await userModel.find({}).select('firstName lastName email');
        res.render('user/other', {users});
    }catch (e){
        console.log(e.message);
    }
})

//Designate certain profiles as supervisors
route.put('/other', async(req, res)=>{
    try{
        let user = await userModel.findById(req.body.selName);
        user.userRole = req.body.userRole;
        user.approvalStatus = req.body.selDirectorate;
        user.approvalStatus = req.body.selDirectorate;
        await user.save();
        res.redirect(`/user/${req.body.selName}`);

    }catch (e){
        console.log(e.message);
    }
})


//get the create new form for user
route.get('/new', adminAuth, async (req,res)=>{ //adminAuth
    // res.send('What item now');
    let user = new userModel();
    let msg = {
        message:'Input profile details',
        class:'green',
        authMsg:{assignShowButtonGrab:'hidePool', auditSubmenuAnchorGrab:'hideAudit'}
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

                        async function idRedirect(req,res, msg){
                            // res.send('Getting the User Page...'+req.params.id);
                            var ownAssets=[];
                            try {
                            const user =await userModel.findById(req.params.id);
                            const allAssetType = await assetTypeModel.find();//.distinct('assetTypeClass')
                            const asset = await assetModel.find({user:user.id}).exec(); //.limit(10)
                            const allAsset = await (await assetModel.find().where('allocationStatus').ne(true));
                            const assetTypeDistinct = await assetTypeModel.find().select('assetTypeClass status description').exec();
                            user.userAsset.id.forEach(async itemArr=>{
                                        ownAssets.push(itemArr);
                                });
                                // let msg = 'User found';
                                console.log('This is asset:')
                                console.log(asset);
                                const records = await assetModel.find().where('_id').in(ownAssets).select('assetCode assetType status').exec();
                            res.render('user/show', {
                                user:user,
                                assetsByUser:asset,
                                allAssets:allAsset,
                                allAssetType,
                                ownAssets:records,
                                assetTypeAll:assetTypeDistinct,
                                msg
                            });

                            }catch (e){
                                console.log(e.message);
                                res.redirect('/index')
                            }
                        }
route.get('/:id', async (req, res)=>{
    idRedirect(req, res, 'User found');
});

async function userLogSave(user, list, assignment, req){
    const userLog = new userLogModel({ //we're later getting asset from the form
        user:user.id,
        activity:assignment,
        assignedBy:req.user.id
    });

    switch(assignment){
        case 'Requisition':
            console.log('Requisition!')
            userLog.userRequisition = list;
            break;
        case 'Assign':
            console.log('Assign')
            // userLog.userAsset.id = list;
            userLog.userRequisition = list;
            break;
        case 'DeAssign':
            console.log('DeAssign')
            // userLog.userAsset.id = list;
            userLog.userRequisition = list;
            break;
        case 'Directorate Approval':
            // userLog.userAsset.id = list;
            userLog.userRequisition = list;
            break;
        case 'Store Approval':
            // userLog.userAsset.id = list;
            userLog.userRequisition = list;
            break;
        default:
            console.log('Does not fit');
    }
    console.log('Saving now+++++++++++++++');
    await userLog.save();
}


// lastName:user.lastName,
// firstName:user.firstName,
// email:user.email,
// state:user.state,
// date:req.body.createdAt,
// phone:user.phone,
// cadre:user.cadre,
// rank:user.rank,
// assetType:req.body.assetTypeName

route.put('/:id', async (req,res)=>{
    console.log(req.query.assignment);
    console.log('This is req.query');
    console.log(req.query);
    let user;
    // let affectedAssets;
    let allAsset;
    let newIdArr = []; //this will contain the filtered array to be reassigned (filtered of object to be deassgined)
    let msg = {};
    console.log(req.method);
    console.log(req.params.id);
    let userAssetArr = JSON.parse(req.params.id);
    console.log(userAssetArr);
    console.log(userAssetArr.userId);

    try{
        user = await userModel.findById(userAssetArr.userId); //, 'firstName lastName cadre userAsset'
        // console.log('This is user:');
        // console.log(user);
        console.log('Here is user Asset:');
        console.log(user.userAsset.id)
        console.log('Here is user idArr:')
        console.log(userAssetArr.idArr)
        allAsset = await assetModel.find();
        
        
        if (req.query.assignment == 'Assign'){
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus').exec();
            console.log('Assign')
            userAssetArr.idArr.forEach(assetId=>{
                newIdArr.push(assetId)
            })
            newIdArr.forEach((arrItem, i)=>{
                user.userAsset.id.push(arrItem);
                user.userAsset.idType.push(affectedAssets[i].assetType);
            })
            
            //affecting assets
            affectedAssets.forEach(async assetArr=>{
                assetArr.allocationStatus = true;
                await assetArr.save();
            })
        }
        
        if (req.query.assignment == 'DeAssign'){
            console.log('DeAssign')
            
            //
            user.userAsset.id.forEach(item=>{
                console.log(item)
                console.log('This is item:', item.toString());
                // if(userAssetArr.idArr.indexOf((item.toString()).slice((item.toString()).indexOf('(')+1, (item.toString()).indexOf(')'))) == -1){
                //     newIdArr.push(item);
                // } //string to mongoose.Types.ObjectId.  How to
                if(userAssetArr.idArr.indexOf((item.toString())) == -1){
                    newIdArr.push(item);
                } //string to mongoose.Types.ObjectId.  How to
            })
            user.userAsset.id= newIdArr;
            let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus').exec();

            // newIdArr = user.userAsset.id.filter(item=>{
            //     console.log(item)
            //     console.log(item.toString());
            //     console.log('This is asset: ', (item.toString).splice((item.toString()).indexOf('(')+1, (item.toString()).indexOf(')'))) //string to mongoose.Types.ObjectId.  How to
            //     return userAssetArr.idArr.indexOf((item.toString()).splice((item.toString()).indexOf('(')+1, (item.toString()).indexOf(')'))) == -1 //string to mongoose.Types.ObjectId.  How to
            // })

            // //
            // user.userAsset.id= newIdArr;
            // user.userAsset.id=userAssetArr.idArr;
            // let affectedAssets = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
            
            var assetTypeArr = [];
            assetsNamesToAssign.forEach(asset=>{
                asset.allocationStatus = false;
                assetTypeArr.push(asset.assetType)
            })
            user.userAsset.idType = assetTypeArr;
            

            // var newUserAsset = assetTypeArr.filter(assetType=>{
            //         return user.userAsset.idType.indexOf(assetType) == -1
            // })
            // user.userAsset.idType = newUserAsset;

             

            // newIdArr.forEach(async assetArr=>{
            //     assetArr.status = 'Used'; //this should have been done at the point of user receiving the item. In future, remove this and redo 
            //     assetArr.allocationStatus = false;
            //     await assetArr.save();
            //  })
        }
        console.log('Here is new arr++++++++++++')
        

        await user.save();
        msg = {
            message:'User Asset updated!',
            class:'green'
        };
        
        userLogSave(user, newIdArr, req.query.assignment, req);
        res.redirect(`/user/${userAssetArr.userId}`);
    } catch(e){
        console.log(e.message);
        
    }
});

route.put('/requisition/:id', async (req, res)=>{
    
    console.log('Type of assignment: ', req.query.assignment);
    let assetRequisitioned = JSON.parse(req.query.requisitionApproval);
    console.log('Asset for directorate approval', assetRequisitioned);
    let userId = req.params.id;
    try{
        let user = await userModel.findById(userId).select('firstName lastName cadre rank directorate approvalStatus');
            console.log(user);
            user.userRequisition = assetRequisitioned;
            await user.save();
        let userDirectorateApprover = await userModel.find().where('userRole').equals('directorateApproval').where('approvalStatus').in([user.directorate, 'All']).select('firstName directorate approvalStatus userDirectorateApproval');
            console.log('This is userDirectorateApprover: ', userDirectorateApprover);
            userDirectorateApprover[0].userDirectorateApproval.push(user);
            await userDirectorateApprover[0].save();
            userLogSave(user, assetRequisitioned, req.query.assignment, req);
        res.redirect(`/user/${user.id}`);
    } catch (e){
        console.error(e);
    }

})

route.put('/directorateRequisitionApproval/:id', async (req, res)=>{
    
    console.log('Type of assignment: ', req.query.assignment);
    let assetRequisitioned = JSON.parse(req.query.directorateApproval);
    console.log('Asset for directorate approval', assetRequisitioned);
    let userId = req.params.id;
    try{
        let user = await userModel.findById(userId).select('firstName lastName cadre rank directorate approvalStatus');

        let userStoreApprover = await userModel.find().where('userRole').equals('storeApproval').where('approvalStatus').in([user.directorate, 'All'])
        userStoreApprover[0].userStoreApproval.push(user);
        await userStoreApprover[0].save();
        userLogSave(user, assetRequisitioned, req.query.assignment, req);
         res.redirect(`/user/${user.id}`);
    } catch (e){
        console.error(e);
    }

})

route.put('/storeRequisitionApproval/:id', async (req, res)=>{
    console.log('This is user for approval', req.params.id);
    let assetRequisitioned = JSON.parse(req.query.storeApproval);
    
    try{
        let user = await userModel.findById(req.params.id).select('firstName lastName cadre rank directorate');;
        user.userClassList = req.query.userClassList;
        await user.save();
        let userIssuerApprover = await userModel.find().where('userRole').equals('Issuer').where('approvalStatus').in([user.directorate, 'All'])
        userIssuerApprover[0].userStoreApproval.push(user);
        await userIssuerApprover[0].save();
        userLogSave(user, assetRequisitioned, req.query.assignment, req);
        res.redirect(`/user/${req.params.id}`);
    }catch(e){
        console.log(e.message);
    }
});
// route.get('/requisitionApproval/:id', async (req, res)=>{
//     res.send('Forwarded for approval: '+req.params.id);
// });


route.delete('/:id', async(req,res)=>{
    let user;
    try {
        let user = await userModel.findById(req.params.id);
        await user.remove();
        //now taking care of req.user.proile info on userCredModel
            let userWhoCreated = await userCredModel.find().where('profileId').equals(req.params.id);
            console.log('This is user who Created:', userWhoCreated);
            // userWhoCreated[0].profileId = "";

           let remainingProfiles = userWhoCreated[0].profileId.filter(profileId=>{
                console.log("profileId: ", profileId, " req.params.id: ", req.params.id);        
                return profileId != req.params.id;
            });
            console.log('This is remainingProfiles', remainingProfiles);
            userWhoCreated[0].profileId = remainingProfiles;
            // userWhoCreated[0].profileId = userWhoCreated[0].profileId.slice(0, userWhoCreated[0].profileId.indexOf(req.params.id));
            
            await userWhoCreated[0].save();

            //lets go on
        console.log('Passed Here')
        res.redirect("/user/index");
    } catch(e){
        console.log(e.message);
        if (user == null){
            console.log('Entered here');
            idRedirect(req, res, 'User still has assets');
            // res.redirect(`/user/${req.params.id}`);
        }else{
            res.redirect(`/user/${user.id}`)
        }
    }
});

//create new user
route.post('/', upload.single('photo'), async (req,res)=>{
    const user = new userModel({ //we're later getting asset from the form
        lastName:req.body.lastName,
        firstName:req.body.firstName,
        email:req.body.email,
        state:JSON.parse(req.body.state).state,
        zone:JSON.parse(req.body.state).zone,
        directorate:req.body.directorate,
        geoCoord:JSON.parse(req.body.state).latLng,
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
                // req.user = user;
                console.log('***************************************************************************')
                console.log(req.user);
                req.user.profileId.push(newUser.id); //now, when this user logs in again, he get's redirected to his profile, not createUser page
                await req.user.save(); 
                console.log(req.user);
                userVar = user;
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
        console.log('This is error above')
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
    console.log(encodedProfile);
    console.log('Above is photo')
    // const profile = JSON.parse(encodedProfile);
    // if (profile !=null && imageMimeTypes.includes(profile.type)){
    //     user.profilePic = new Buffer.from(profile.data, 'base64');
    //     user.profilePicType = profile.type;
    // }

        user.profilePic = encodedProfile;
        user.profilePicType = 'An Image';
   

}




module.exports = route;
