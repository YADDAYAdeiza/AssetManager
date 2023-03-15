let express = require('express');
let route = express.Router();
let mongoose = require('mongoose');

let ejs = require('ejs');
let {v4:uuidv4} = require('uuid');

// let layout = require('express-ejs-layouts');
let userModel = require('../models/user');
const assetTypeModel = require('../models/assetType.js');
const assetModel = require('../models/asset.js');
const { rawListeners } = require('../models/assetType.js');
const { response } = require('express');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
let userLogModel = require('../models/userLog');
let userLogModel2 = require('../models/userLog2');
let userCredModel = require('../models/userCred');

const nodemailer = require("nodemailer");
const conn = require("../models/connection");


const io = require('socket.io')(3000, {
    cors:
    {
        origin:['http://localhost:2000']
    }
});

// function notifyUser(user){

// let socket;
    io.on('connection', socket=>{
        console.log('This is socket ', socket.id);
    // socket = socket;
        // socket.on('join-room', (id, room, cb)=>{
        //     console.log(`${id} of socket ${socket.id} is joining room ${room}`)
        //     socket.join(room);
    //         // if (user.id === '633f06277f9b361fa2daa0fe'){
    //             cb(`${id} joined room`);
    //         // }
    //         // socket.emit('room-joined', `${id} joined room`)
        // })
    })
// }



// const express = require('express');
// const app = express();
// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);

// io.on('connection', (socket) => {
//     console.log('--------------------------------------------------')
//     console.log('a user connected', socket.id);
//     socket.on('disconnect', () => {
//       console.log('user disconnected');
//     });
//   });
//   server.listen(3000, () => {
//     console.log('listening on *:3000');
//   });

// console.log(authenticateRole().toString());









//authentication
const {adminAuth} = require('../basicAuth');
let {authenticateRole, authenticateRoleProfilePage, permitLists, permitListsLogin, hideNavMenu, permitApproval} = require('../basicAuth');
let {userLogSave, userLogSave2} = require('../utilFile');


// const { reset } = require('nodemon');

let multer = require('multer');
const { off } = require('../models/userCred');
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
route.get('/confirmArrival/:id/:uuid', async (req, res)=>{
    console.log('This is req.user: ',req.user);
    let userArr = [];
    let userAssets = [];
    // let assetItemId;
    console.log('This is confirmArrival...');
     console.log(`Confirming receipt... on ${req.params.id} and ${req.params.uuid}`);
     try {
        for (let userId of req.user.profileId){
            let user = await userModel.find({}).where('_id').equals(userId);
            userArr.push(await user)
            // console.log(user);
    
            // for (let assetId of user.userOwnedAsset.id){
                if (await user[0].userOwnedAsset){
                    for (assetId of await user[0].userOwnedAsset.id){
                        console.log('Entering now...')
                        let asset = await assetModel.find({}).where('_id').equals(assetId);
                        console.log('This is asset ', asset);
                        console.log('This is user ', user[0].firstName);
                        req.params.id = user[0]._id; // recalibrating hack
                        req.routeStr = 'user/show2';
                        for (assetItem of asset){
                            if (await assetItem.assetCode == req.params.uuid){
                                console.log('Entered, ')
                             userAssets.push(await assetItem);
                            //  assetItemId = assetItem._id;
                            // let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetCode assetType assetName status assetUserHistory assetLocationHistory allocationStatus').exec();
                            // asset
                                    
                            assetItem.assetApproval.received = 'approved';
                            // asset.assetApproval ={
                                //     ownApproval:'approved',
                                //     stateApproval:null,
                                //     directorateApproval:null,
                                //     storeApproval:null,
                                //     issuerApproval:null
                                // };
                                user[0].receivedUserAsset.id.push(assetItem._id);
                                await user[0].save();
                                //Log
                                let objActivity = {
                                    activity:req.query.assignment,
                                    user:user.id,
                                    activityBy:req.user.id,
                                    activityDate:new Date (Date.now())
                                };

                                assetItem.assetActivityHistory.push(objActivity);
                                await assetItem.save();
                            
                                // userLogSave(user, newIdArr, req.query.assignment, req);
                                // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                                // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                                userLogSave(user[0], newIdArr, 'Received Asset', req);
                                userLogSave2(user[0], newIdArr, 'Received Asset', req); //modern log
                        //End of Log
                            }
                        }
                    }
                }
            }
    
            if (await userAssets.length && req.user.subRole == 'staff'){
                console.log('This is length ', await userAssets.length);
                // res.render('./user/confirmPage.ejs', {id:req.params.id, uuid:req.params.uuid})
                idRedirect(req, res, 'User found');
                
            } else if (await userAssets.length && req.user.subRole == 'auditor'){
                console.log('The option page');
                res.render('./user/receiveOrAudit.ejs', {id:req.params.id, uuid:req.params.uuid})
            } else if (await userAssets.length == 0 && req.user.subRole == 'auditor'){
                console.log('auditing ...', req.params.uuid);
                res.redirect(`/user/assetDetail/${req.params.uuid}`);
                res.send('Asset Page');
            }else {
                console.log('Not found');
                res.render('./user/confirmPage.ejs', {id:req.params.id, uuid:req.params.uuid})
            }
     }catch (e){
        console.log(e.message)
     }
     
})

route.get('/assetDetail/:assetItemId', async (req, res)=>{
    console.log(`Getting details of ${req.params.assetItemId}`);
    try{
        let asset = await assetModel.find({}).where('assetCode').equals(req.params.assetItemId).populate('assetUserHistory');
        console.log('Asset is: ', asset[0]);
        res.render('./user/assetDetails.ejs', {asset:asset[0]})
    }catch(e){
        console.log(e.message)
    }
});

route.get('/directReceive/:id/:assetItemId', async (req, res)=>{ 
    console.log(`directly receiving of ${req.params.assetItemId}`);
    try{
        let user = await userModel.find({}).where('_id').equals(req.params.id);
        let asset = await assetModel.find({}).where('assetCode').equals(req.params.assetItemId).populate('assetUserHistory');
            req.params.id = user[0]._id; // recalibrating hack
            req.routeStr = 'user/show2';
        asset[0].assetApproval.received = 'approved';
        user[0].receivedUserAsset.id.push(assetItem._id);
        await user[0].save();
        // console.log('Asset is: ', asset[0]);
        idRedirect(req, res, 'User found');
        // res.render('./user/assetDetails.ejs', {asset:asset[0]})
    }catch(e){
        console.log(e.message)
    }
});

 
route.get('/fetcher/:id', async (req,res)=>{
    console.log('Fetching...');
    console.log('This is button requesting fetch: ', req.params.id)
    let usedAssets = await assetModel.find().where('assetAllocationStatus').equals('false').where('assetName').equals(req.params.id); //used assets
    res.json(usedAssets);
})

route.get('/getHistory/:id', async (req,res)=>{
    let userHistory = await userLogModel.find().where('activity').in(['Requisition', 'Directorate Approval', 'Store Approval']).where('user').equals(mongoose.Types.ObjectId(req.params.id));
   
    res.json(userHistory);
})
//This is for determining if, straight from login success, to go to Register New User or User profile.
route.get('/showOrNew', permitListsLogin(), hideNavMenu(), (req, res)=>{ //admin middleware may be used here to grant full authorization
    console.log('In showOrNew=====================================');
    if (req.user.profileId.length){// show profiles, orole
        console.log('This is req: ', req.user);
        console.log('This is req.user.userName:', req.user.userName);
        indexRedirect(req, res, 'My Profile(s)', 'noError');
    } else{ //create new profile
        res.redirect('/user/new');
    }
})

                        async function indexRedirect(req, res, next, msg, msgClass){
                            // let query = userModel.find();
                            let userApprovalRoles = await userModel.find({}).where('approvalStatus').ne(null).distinct('approvalStatus');
                            // let userStoreApprovalRoles = await userModel.find({}).where('userStoreApproval').ne(null).distinct('approvalStatus');
                            let query = req.queryObj; //from permitLists middleware
                            console.log('Back here');
                            // console.log(query);
                            if (req.query.userNameSearch != null && req.query.userNameSearch != ""){
                                console.log('Ent')
                                query = query.regex('firstName', new RegExp(req.query.userNameSearch, 'i'));
                            }
                            if (req.query.userDateBeforeSearch != null && req.query.userDateBeforeSearch != ""){
                                console.log('Ent')
                                query = query.lte('dateCreated', req.query.userDateBeforeSearch);
                            }
                            if (req.query.userApprovalRole != null && req.query.userApprovalRole != ""){
                                console.log('Ent')
                                // req.query.userApprovalRole = (req.query.userApprovalRole == 'All')? null: req.query.userApprovalRole
                                if (req.query.userApprovalRole == 'All'){
                                    //Don't add to the query: Leave as is.
                                }else {
                                    console.log('Ent');
                                    query = query.where('approvalStatus').equals(req.query.userApprovalRole);
                                }

                            }
                            
                            
                            console.log('Logging req.query');
                            // console.log(req.query);
                            console.log(req.dispSetting);
                            let uiSettings = req.dispSetting;
                            //coming from authorization ; things like this should be temporary and is to be fixed in authorization middleware?
                            //Rather than set admin to req.user.profileId, we'll set it to a wild card, that'll allow anything. 
                            console.log('This is message:', msg);

                            //filtering
                                    if (msg == 'My Profile(s)'){
                                        console.log('=%')
                                        query = query.where('_id', req.user.profileId); //work on this
                                    } 


                            // else{
                            //     if (req.profile){
                            //         query = (await query.where('_id').in(req.profile)); //work on this
                            //     }
                            // }
                            
                            //consider
                            // req.queryObj = query;
                            // req.msg = msg
                            
                            // next();
                            console.log('userApprovalRoles: ', userApprovalRoles)
                            try{
                                console.log('Going well1');
                                // console.log(query)
                                const users = await query.exec();
                                console.log(users)
                                console.log('Going well2');
                                res.render('user/index.ejs', {
                                    users:users,
                                    searchParams:req.query,
                                    msg,
                                    msgClass,
                                    userName:req.user.userName,
                                    userEmail:req.user.email,
                                    uiSettings,
                                    userApprovalRoles
                                }); //tying the view to the moongoose model

                                                        // function notifyUser(user){
                                                                // io.on('connection', socket=>{
                                                                //     console.log('This is socket ', socket.id);
                                                                
                                                                //     socket.on('join-room', (id, room, cb)=>{
                                                                //         console.log(`${id} of socket ${socket.id} is joining room ${room}`)
                                                                //         socket.join(room);
                                                                //         // if (user.id === '633f06277f9b361fa2daa0fe'){
                                                                //             cb(`${id} joined room`);
                                                                //         // }
                                                                //         // socket.emit('room-joined', `${id} joined room`)
                                                                //     })
                                                                // })
                                                            // }
                                
                            }catch(e) {
                                console.log('An error occured');
                                console.log(e.message);
                                console.log(e);
                                console.error(e);
                                console.error(e.message);
                                // res.render('user/index.ejs', {msg: `An error occurred getting the list`, searchParams:req.query, msgClass:'error-message'}); //tying the view to the moongoose model
                                res.render('register.ejs'); //tying the view to the moongoose model
                            }
                            //msg:"error goes in here",
                        }
route.get('/index', permitListsLogin(), hideNavMenu(), async (req, res)=>{
    console.log('This is signed in user now', req.user);
    // console.log(req.query);
    console.log(req.queryObj); //from permitLists
    indexRedirect(req, res, 'Listed fine', 'noError') 
})

route.get('/other', hideNavMenu(), async (req, res)=>{
    try{
        let users = await userModel.find({}).select('firstName lastName email');
        res.render('user/other', {users});
    }catch (e){
        console.log(e.message);
    }
})

//Designate certain profiles as supervisors
route.put('/other', async(req, res)=>{
    console.log('Body');
    console.log(req.body);
    let domainApproved = (req.body.userRole == 'stateApproval')? JSON.parse(req.body.selState).state:req.body.selDirectorate;
    try{
        let user = await userModel.findById(req.body.selName);
        console.log(user);
        user.userRole.role = req.body.userRole;
        user.userRole.domain = domainApproved;
        let user2 = await user.save();
        console.log(user2);
        res.redirect(`/user/${req.body.selName}`);

    }catch (e){
        console.log(e.message);
    }
})


//get the create new form for user
route.get('/new', adminAuth, hideNavMenu(), async (req,res)=>{ //adminAuth
    // res.send('What item now');
    let user = new userModel();
    let msg = {
        message:'Input profile details',
        class:'green',
        authMsg:{assignShowButtonGrab:'hidePool', auditSubmenuAnchorGrab:'hideAudit'}
    }
    renderNewPage(res, user, msg,req)
})

async function renderNewPage(res, user, msg, req){
    console.log('Got here1');
    try{
        let assetTypeModelArr = await assetTypeModel.find({});
        let uiSettings = req.dispSetting;
        console.log('Got here2');
        res.render('user/new.ejs', {user: user, assetTypeArr:[1,2,3,4,5], msg:msg, uiSettings}); //tying the view to the moongoose model

    }catch (e){
        //list of users
        console.error(e);
        console.log('Another error message above');
        res.redirect('user/index');
    }
}


route.get('/:id/edit',  hideNavMenu(), async (req,res)=>{
    console.log('Editing...');
    try{
        let userModelArr = await userModel.findById(req.params.id);
        let assetTypeModelArr = await assetTypeModel.find({});
        msg = "Making changes";
        res.render('user/edit.ejs',{user: userModelArr, assetTypeArr:assetTypeModelArr, msg}); //tying the view to the moongoose model //, 

    } catch (e){
        res.redirect('/user/index');
    }
    // let user = new userModel();
})

                        async function idRedirect(req,res, msg){
                            console.log('Redirecting to '+req.params.id);
                            // res.send('Getting the User Page...'+req.params.id);
                            var ownAssets=[];
                            var approvedAssets = [];
                            var directorateApprovedAssets = [];
                            var storeApprovedAssets = [];
                            var issueApprovedAssets = [];
                            var receivedUserAsset = [];
                            var usersToApprove = [];
                            try {
                            const user =await userModel.findById(req.params.id);
                            console.log('This place?', user)
                            const allAssetType = await assetTypeModel.find().select('_id assetTypeCode assetTypeClass assetTypeStatus assetTypeDescription assetTypeQty').exec();//.distinct('assetTypeClass');
                            const asset = await assetModel.find({user:user.id}).exec(); //.limit(10)
                            console.log('This place 2?')
                            const allAsset = await (await assetModel.find().where('assetAllocationStatus').ne(true).select('_id assetType'));
                            const assetTypeDistinct = await assetTypeModel.find().select('_id assetTypeClass assetTypeStatus assetTypeDescription').exec();
                            
                            console.log('OR. This place?')

                            user.userAsset.id.forEach(async itemArr=>{
                                        ownAssets.push(itemArr);
                                });
                                //getting approved user assets (to be painted green)
                                user.approvedUserAsset.id.forEach(async itemArr=>{
                                    approvedAssets.push(itemArr.toString());
                                });
                                // getting directorate approved assets, to be painted purple
                                user.directorateApprovedUserAsset.id.forEach(async itemArr=>{
                                    directorateApprovedAssets.push(itemArr.toString());
                                });
                                user.storeApprovedUserAsset.id.forEach(async itemArr=>{
                                    storeApprovedAssets.push(itemArr.toString());
                                });
                                user.issueApprovedUserAsset.id.forEach(async itemArr=>{
                                    issueApprovedAssets.push(itemArr.toString());
                                });
                                user.receivedUserAsset.id.forEach(async itemArr=>{
                                    receivedUserAsset.push(itemArr.toString());
                                });

                                // user.userRole.usersToApprove.forEach(userId=>{
                                //     usersToApprove.push(userId);
                                // })

                                // user.userRole.usersToApprove.forEach(userObj=>{
                                //     usersToApprove.push(userObj);
                                // })

                                
                                //We're trying to convert the asset object reference to the fulll object
                                for (const userObj of user.userRole.usersToApprove){
                                    let assetArr = [];
                                    let userObj2 = {approvedAssets:[]};
                                    userObj2.id = userObj.id;
                                    console.log('Got in now', userObj);
                                    for ( const asset of userObj.approvedAssets){
                                        // console.log('This is asset, ', asset);
                                        let assets = await assetModel.find({}).where('_id').equals(asset);
                                        // console.log('This is assetArr ', assets[0]);
                                        assetArr.push(assets[0]);
                                        userObj2.approvedAssets.push(assets[0])
                                    }
                                    // userObj.approvedAssets = assetArr;
                                    // console.log('This is userObj ', userObj2);
                                    usersToApprove.push(userObj2);
                                }

                                console.log('This is directorateApprovedAssets: ', directorateApprovedAssets);
                                console.log('This is approved assets ', approvedAssets);
                                console.log('This is store approved assets ', storeApprovedAssets);
                                console.log('This is usersToApprove ', usersToApprove);
                                // let msg = 'User found';
                                console.log('This is asset:')
                                console.log('This is msg ', msg);
                                // console.log(asset);
                                const records = await assetModel.find().where('_id').in(ownAssets).select('assetCode assetName assetType assetStatus').exec();
                            // console.log('This is allAssetType ', allAssetType);
                                
                            var allAssetTypeMap2 = allAssetType.map(arrItem=>{
                                return arrItem.assetTypeClass;
                            })
                            let allAssetType2 = [];
                                allAssetTypeMap2.forEach((arrItem, index, self)=>{
                                    if (self.lastIndexOf(arrItem) == index){
                                        allAssetType2.push(allAssetType[index]);
                                    }
                                })
                                // console.log('This is allAssetType2', allAssetTypeMap2);
                            let uiSettings = req.dispSetting;
                            let approvalSettings = req.approvalSettings;
                            let ownAccount = req.ownAccount;
                            let approvingId = req.params.approvalId; //used for reloading approving staff page
                            console.log('This is uiSettings', uiSettings);
                            console.log('This is chosen route: ', req.routeStr);
                            console.log('This is approval Settings, ', approvalSettings);
                            console.log('This is approving Id', approvingId);
                            // console.log('This is approval ', req.params.approval);
                            res.render(req.routeStr, { //req.routeStr, modified by authentication middleware to hold route address in views folder
                                user:user,
                                allAssets:allAsset,
                                assetsByUser:asset, 
                                allAssetType:allAssetType2,
                                ownAssets:records,
                                approvedAssets,
                                directorateApprovedAssets,
                                storeApprovedAssets,
                                issueApprovedAssets,
                                receivedUserAsset,
                                usersToApprove,
                                assetTypeAll:allAssetType2,//assetTypeDistinct
                                uiSettings,
                                ownAccount,
                                approvalSettings:req.approvalSettings?req.approvalSettings:{nonOwnApprovalClass:'none'},
                                approvingId,
                                msg,
                                divApprovalSetting:req.params.approval?req.params.approval:user.userRole.role
                                // divApprovalSetting:req.params.approval?req.params.approval:'ownApproval'
                            });

                            }catch (e){
                                console.error(e.message);
                                // res.redirect('/user/index');
                            }
                        }
route.get('/:id', authenticateRoleProfilePage(),hideNavMenu(), async (req, res)=>{
    console.log('First...');
    console.log('This is approval', req.params.approval);
    idRedirect(req, res, 'User found');
});

route.get('/:id/:approval/:approvalId', authenticateRoleProfilePage(),hideNavMenu(), permitApproval(), async (req, res)=>{
    console.log('This is approval ', req.params.approval);
    console.log('This is approvalId ', req.params.approvalId);
    console.log('This is approval settings: ', req.approvalSettings);
    idRedirect(req, res, 'User found');
});



// lastName:user.lastName,
// firstName:user.firstName,
// email:user.email,
// state:user.state,
// date:req.body.createdAt,
// phone:user.phone,
// cadre:user.cadre,
// rank:user.rank,
// assetType:req.body.assetTypeName

route.put('/:id', async(req,res)=>{
    console.log(req.params.id);
    console.log(req.params.id.length);
    console.log(req.body.firstName);
    console.log(req.body.state);


    // let user = await userModel.find({id:req.params.id});
    
    try{
        let user = await userModel.findById(req.params.id);
    console.log('This is user ', user);
    console.log('Putting now...');
    // console.log(typeof user.date);
    // console.log(user.date);
        user.lastName = req.body.lastName;
        user.firstName = req.body.firstName;
        user.email = req.body.email;
        user.state = JSON.parse(req.body.state).state;
        user.zone = JSON.parse(req.body.state).zone;
        user.directorate = req.body.directorate;
        user.geoCoord = JSON.parse(req.body.state).latLng;
        user.phone = req.body.phone;
        user.cadre = req.body.cadre;
        user.rank = req.body.rank;
        user.assetType = req.body.assetTypeName;

        if (req.body.photo){
            saveProfilePic(user, req.body.photo);
        }
    console.log('Done putting...');
        await user.save();
        msg = "Update made";
        idRedirect(req,res, msg)
        // res.render('./user/show', {user});
    }catch (e){
        console.error(e.message);
    }

})

// route.put('/assignDeassign/:id', async (req,res)=>{
//     console.log(req.query.assignment);
//     console.log('This is req.query');
//     console.log(req.query);
//     let user;
//     // let affectedAssets;
//     let allAsset;
//     let newIdArr = []; //this will contain the filtered array to be reassigned (filtered of object to be deassgined)
//     let msg = {};
//     console.log(req.method);
//     console.log(req.params.id);
//     let userAssetArr = JSON.parse(req.params.id);
//     console.log(userAssetArr);
//     console.log(userAssetArr.userId);

//     try{
//         user = await userModel.findById(userAssetArr.userId); //, 'firstName lastName cadre userAsset'
//         // console.log('This is user:');
//         // console.log(user);
//         console.log('Here is user Asset:');
//         console.log(user.userAsset.id)
//         console.log('Here is user idArr:')
//         console.log(userAssetArr.idArr)
//         allAsset = await assetModel.find();
        
        
//         if (req.query.assignment == 'Assign'){
//             let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus').exec();
//             console.log('Assign')
//             userAssetArr.idArr.forEach(assetId=>{
//                 newIdArr.push(assetId)
//             })
//             newIdArr.forEach((arrItem, i)=>{
//                 user.userAsset.id.push(arrItem);
//                 user.userAsset.idType.push(affectedAssets[i].assetType);
//             })
            
//             //affecting assets
//             affectedAssets.forEach(async assetArr=>{
//                 assetArr.allocationStatus = true;
//                 await assetArr.save();
//             })
//         }
        
//         if (req.query.assignment == 'DeAssign'){
//             console.log('DeAssign')
            
//             //
//             user.userAsset.id.forEach(item=>{
//                 console.log(item)
//                 console.log('This is item:', item.toString());
//                 // if(userAssetArr.idArr.indexOf((item.toString()).slice((item.toString()).indexOf('(')+1, (item.toString()).indexOf(')'))) == -1){
//                     //     newIdArr.push(item);
//                     // } //string to mongoose.Types.ObjectId.  How to
//                     if(userAssetArr.idArr.indexOf((item.toString())) == -1){
//                         newIdArr.push(item);
//                     } //string to mongoose.Types.ObjectId.  How to
//                 })
//                 //  ... = userAssetArr.idArr()
//                 let affectedAssetsToDeassign = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus').exec();
                
//                 affectedAssetsToDeassign.forEach(async asset=>{
//                     asset.assetAllocationStatus = false; //making it an old asset
//                     await asset.save();
//                 });

//             user.userAsset.id= newIdArr;
//             let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
//             let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus').exec();

//             // newIdArr = user.userAsset.id.filter(item=>{
//             //     console.log(item)
//             //     console.log(item.toString());
//             //     console.log('This is asset: ', (item.toString).splice((item.toString()).indexOf('(')+1, (item.toString()).indexOf(')'))) //string to mongoose.Types.ObjectId.  How to
//             //     return userAssetArr.idArr.indexOf((item.toString()).splice((item.toString()).indexOf('(')+1, (item.toString()).indexOf(')'))) == -1 //string to mongoose.Types.ObjectId.  How to
//             // })

//             // //
//             // user.userAsset.id= newIdArr;
//             // user.userAsset.id=userAssetArr.idArr;
//             // let affectedAssets = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
            
//             var assetTypeArr = [];
//             assetsNamesToAssign.forEach(asset=>{
//                 asset.allocationStatus = false;
//                 assetTypeArr.push(asset.assetType)
//             })
//             user.userAsset.idType = assetTypeArr;
            

//             // var newUserAsset = assetTypeArr.filter(assetType=>{
//             //         return user.userAsset.idType.indexOf(assetType) == -1
//             // })
//             // user.userAsset.idType = newUserAsset;

             

//             // newIdArr.forEach(async assetArr=>{
//             //     assetArr.status = 'Used'; //this should have been done at the point of user receiving the item. In future, remove this and redo 
//             //     assetArr.allocationStatus = false;
//             //     await assetArr.save();
//             //  })
//         }
//         console.log('Here is new arr++++++++++++')
       

//         await user.save();
//         msg = {
//             message:'User Asset updated!',
//             class:'green'
//         };
        
//         userLogSave(user, newIdArr, req.query.assignment, req);
//         res.redirect(`/user/${userAssetArr.userId}`);
//     } catch(e){
//         console.log(e.message);
        
//     }
// });

route.put('/assignDeassign2/:id', async (req,res)=>{
    let userAssetArrIdArrObj = {};
    let affectedAsset;
    let affectedAssetTypeObj = {};
    console.log('Inside assignDeassign2');
    console.log(req.query.assignment);
    console.log('This is req.query');
    console.log(req.query);
    let user;
    let affectedAssets;
    let allAsset;
    let newIdArr = []; //this will contain the filtered array to be reassigned (filtered of object to be deassigned)
    let newIdArr2 = [];
    let msg = {};
    console.log(req.method);
    console.log(req.params.id);
    let userAssetArr = JSON.parse(req.params.id);
    console.log(userAssetArr);
    console.log(userAssetArr.userId);
    let redirectUser;// used to redirect to approver (or applicant) page
    let userObj = {};

    try{
        user = await userModel.findById(userAssetArr.userId); //, 'firstName lastName cadre userAsset'
        console.log('This is user:');
        console.log(user);
        console.log('Here is user Asset:');
        console.log(user.userAsset.id)
        console.log('Here is user idArr:')
        console.log(userAssetArr.idArr)
        
        console.log('Here is user idTypeArr:')
        console.log(userAssetArr.idTypeArr)

        // idTypeArr
        allAsset = await assetModel.find();
        
        //preparing asset type object
                //initializing
                userAssetArr.idArr.forEach(assetId=>{
                    userAssetArrIdArrObj[assetId] = 0;
                })

                //incrementing
                userAssetArr.idArr.forEach(assetId=>{
                    // assetId = assetId.slice(assetId.indexOf('"')+1, assetId.lastIndexOf('"'))
                    userAssetArrIdArrObj[assetId]++;
                })

                console.log('This is userAssetArrIdArrObj: ');
                console.log(userAssetArrIdArrObj)
        
        if (req.query.assignment == 'Assign'){
            //takes all assetTypesIds from tentative asset div(upper) and appends them to present assets
            let newAsset;
            if (userAssetArr.idArr.length){ //assigning new assets
                let objActivity = {
                    activity:req.query.assignment,
                    user:user.id,
                    activityBy:req.user.id,
                    activityDate:new Date (Date.now())
                };
                    let affectedAssetType = await assetTypeModel.find().where('_id').in(userAssetArr.idArr).select('_id assetTypeQty assetTypeImageName assetTypeDescription assetTypeClass').exec();
                    
                
                        console.log('This is affectedType, ', affectedAssetType);
                        //initializing
                        affectedAssetType.forEach(assetTypeId=>{
                            console.log('Now ',assetTypeId._id.toString());
                            var assetTypeIdTrim = assetTypeId._id.toString();
                            affectedAssetTypeObj[assetTypeIdTrim] = 0;
                        })
                        console.log('--------');
                        affectedAssetType.forEach(assetTypeId=>{
                            var assetTypeIdTrim = assetTypeId._id.toString();//.slice(assetTypeId._id.toString().indexOf('"')+1, assetTypeId._id.toString().lastIndexOf('"')+1)
                            console.log(assetTypeIdTrim);
                            affectedAssetTypeObj[assetTypeIdTrim] = userAssetArrIdArrObj[assetTypeIdTrim];
                        })

                    console.log('This is affectedAssetTypeObj, ', affectedAssetTypeObj); //is it not the same as userAssetArrIdArrObj?
                    
                    //Decrement assetTypeQty
                            //Should this be moved to approve -yes.
                    affectedAssetType.forEach(async (assetType, i)=>{
                        // console.log('Witin each...');
                        //assetType.assetTypeQty -= affectedAssetTypeObj[assetType._id];
                        await assetType.save();
                        // console.log(typeof assetType.assetTypeQty)
                        // console.log(typeof affectedAssetTypeObj[assetType._id])
                        // console.log(assetType.assetTypeQty);
                        // console.log('assetType saved', assetType);
                    });

                    //create assets
                    let affectedAssetType2 = affectedAssetType.map(asset=>{
                        return asset._id.toString();
                    })
                    console.log('This is mapped affectedAssetType ', affectedAssetType2);
                    ///userAssetArr.idArr.forEach(async itemId =>{
                        for (const itemId of userAssetArr.idArr){
                            if (affectedAssetType2.indexOf(itemId) != -1){
                                console.log('Match', req.user.email );
                                let assetType = affectedAssetType[affectedAssetType2.indexOf(itemId)]
                                
                                let newAsset = new assetModel({
                                    // assetCode: uuidv4(),
                                    assetType: assetType._id,
                                    assetName: assetType.assetTypeClass,
                                    assetStatus:'Applied',
                                    assetImageName: assetType.assetTypeImageName,
                                    assetDescription:assetType.assetTypeDescription,
                                    assetAllocationStatus:false
                                })
                                                    newAsset.assetUserHistory.push(user.id);
                                                    newAsset.assetLocationHistory.push(user.id);
                            //Log -asset
                                newAsset.assetActivityHistory.push(objActivity)
                            //End of Log -asset
                                let newAssetSaved = await newAsset.save();
                                
                                //likely
                                user.userAsset.id.push(newAssetSaved._id);
                                user.userAsset.idType.push( newAssetSaved.assetName);
                                user.userAsset.assignDate.push(Date.now());
                                let idAuditObj = {
                                    id: newAssetSaved._id,
                                    auditDate: Date.now(),
                                    assetTypeId:newAssetSaved.assetType
                                    //assetTypeName:newAssetSaved.assetName
                                }
                                
                                //likely
                                user.userAsset.idAudit.push(idAuditObj);
                                
                                console.log('This is newAssetSaved', newAssetSaved);

                                // await user.save();
                                newIdArr.push(await newAssetSaved._id); //for use in userLogSave()
                                newIdArr2.push(await newAssetSaved);
                                
                            }
                        }
                       // })
                        console.log('This is newIdArr', newIdArr);
                        console.log('This is newIdArr2', newIdArr2);     

                  let stateApprover = await userModel.find({}).where('userRole.role').equals('stateApproval').where('userRole.domain').equals(user.state);//.where('userRole.domain').equals(user.directorate)
                        let userObj = {
                            id:user._id,
                            approvedAssets:newIdArr
                        }
                        console.log('This is userObj now ', userObj);
                                stateApprover[0].userRole.usersToApprove.push(userObj);

                                await stateApprover[0].save();  
                    // redirectUser = stateApprover[0].id;
                    redirectUser = user.id;
                                console.log('stateApprover now', stateApprover[0]); 
                }
                if (userAssetArr.idArrAsset.length){ //if we have old assets to assign
                    // for use with Asset Log
                        let objActivity = {
                            activity:req.query.assignment,
                            user:user.id,
                            activityBy:req.user.id,
                            activityDate:new Date (Date.now())
                        };
                    //End 
                    let affectedAsset = await assetModel.find().where('_id').in(userAssetArr.idArrAsset).select('_id assetCode assetName assetUsedDuration assetDescription assetUserHistory assetLocationHistory').exec();
                    console.log('Here is affected asset (not type):')
                    console.log(affectedAsset);
                    // affectedAsset.forEach(async asset=>{
                    for (const asset of affectedAsset){
                        console.log('Entered...');
                        asset.assetAllocationStatus = true;
                        asset.assetUserHistory.push(user.id);
                        asset.assetLocationHistory.push(user.id);
                        //Log -asset
                            asset.assetActivityHistory.push(objActivity)
                        //End of Log -asset
                        await asset.save();
                        newIdArr.push(asset._id); //newIdArr for use in userLogSave
                        
                        //likely
                        user.userAsset.id.push(asset._id);
                        user.userAsset.idType.push(asset.assetName);
                        user.userAsset.assignDate.push(Date.now());
                        let idAuditObj = {
                            id: asset._id,
                            auditDate: Date.now(),
                            assetTypeId:asset.assetType
                            //assetTypeName:newAssetSaved.assetName
                        }
                            user.userAsset.idAudit.push(idAuditObj);
                        
                        // user.userAsset.id.push(newAssetSaved._id);
                        //         user.userAsset.idType.push( newAssetSaved.assetName);
                        
                        
                        //
                                
                                // console.log('This is newAssetSaved', newAssetSaved);

                                // await user.save();
                                // newIdArr.push(await asset._id); //for use in userLogSave()
                                newIdArr2.push(await asset);

                        //

                    //});
                    }

                    let stateApprover = await userModel.find({}).where('userRole.role').equals('stateApproval').where('userRole.domain').equals(user.state);//.where('userRole.domain').equals(user.directorate)
                        let userObj = {
                            id:user._id,
                            approvedAssets:newIdArr
                        }
                        console.log('This is is userObj ', userObj);
                        stateApprover[0].userRole.usersToApprove.push(userObj);

                        await stateApprover[0].save();  
                        // redirectUser = stateApprover[0].id;
                        redirectUser = user.id;
                        console.log('stateApprover now', stateApprover[0]);
                }//end of old assets to assign
            
            await user.save();
          

            // saveAssetImageDetails(newAsset, req.body.assetPic);

                                // function saveAssetImageDetails(user, encodedProfile){
                                //     if (encodedProfile == null) return
                                    
                                //     const profile = JSON.parse(encodedProfile);
                                //     console.log('-----------');
                                //     console.log(profile.type);
                                //     if (profile !=null && imageMimeTypes.includes(profile.type)){
                                //         user.assetImageName = new Buffer.from(profile.data, 'base64');
                                //         user.assetImageType = profile.type; 
                                //     }
                                // }
            // affectedAssets
            // Decrement AssetType
            console.log('Assign')
            // userAssetArr.idArr.forEach(assetId=>{
            //     newIdArr.push(assetId)
            // })
            // newIdArr.forEach((arrItem, i)=>{
            //     user.userAsset.id.push(arrItem);
            //     user.userAsset.idType.push(affectedAssets[i].assetType);
            // })
            
            //affecting assets
            // affectedAssets.forEach(async assetArr=>{
            //     assetArr.allocationStatus = true;
            //     await assetArr.save();
            // })

            //Log -user            
                userLogSave(user, newIdArr, req.query.assignment, req);
                userLogSave2(user, newIdArr, req.query.assignment, req); //modern log
            //End of Log

            // notifyUser(user)
        }
        
        if (req.query.assignment == 'DeAssign'){
            //takes only ticked items from own list and subtracts it from user asset (user.userAsset.id)

            console.log('DeAssign now');
           
            user.userAsset.id.forEach(item=>{
                if(userAssetArr.idArr.indexOf((item.toString())) == -1){
                    newIdArr.push(item);
                } //string to mongoose.Types.ObjectId.  How to
            })

            let stateApprover = await userModel.find({}).where('userRole.role').equals('stateApproval').where('userRole.domain').equals(user.state);//.where('userRole.domain').equals(user.directorate)
            // stateApprover[0].userRole.usersToApprove.forEach(objItem=>{
            for (const objItem of stateApprover[0].userRole.usersToApprove){
                objItem.approvedAssets.forEach((asset,i)=>{
                // for (asset of objItem.approvedAssets(asset,i)=>{
                    console.log('second foreach')
                    if(userAssetArr.idArr.indexOf((asset.toString())) > -1){
                        console.log(objItem.approvedAssets);
                        console.log('Splicing...')
                        objItem.approvedAssets.splice(i,1);
                        console.log(objItem.approvedAssets);
                    }
                })
                
            }
            //remove if holding nothing
            for (var a=0;a < stateApprover[0].userRole.usersToApprove.length;a++){
                if (stateApprover[0].userRole.usersToApprove[a].approvedAssets.length ==0){
                    stateApprover[0].userRole.usersToApprove.splice(a,1); 
                }
            }
            let savedStateApprover = await stateApprover[0].save();

    //userAssetArr.idArr //items to deAssign

            //reassign updated assetIds to user
            user.userAsset.id = newIdArr;
            let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus assetApproval').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus assetApproval').exec();

            //return affected Assets to Asset pool (used)
            //This will be in each approval stage
            affectedAssets.forEach(async asset=>{
                console.log('Did it get here?');
                asset.assetAllocationStatus = false;
                asset.assetApproval.self = null;
                let savedAsset = await asset.save();
                console.log(savedAsset);
            })
            var assetTypeArr = [];
            assetsNamesToAssign.forEach(asset=>{
                console.log('Is this right?');
                asset.assetAllocationStatus = false; //we have to bring false assets and store them under their asset Divs as used items
                assetTypeArr.push(asset.assetType); //or asset.assetName?
            })

            //reassign updated assetId types to user
            user.userAsset.idType = assetTypeArr; //very correct
            console.log('6--');
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            redirectUser = user.id;
            //Log
                let objActivity = {
                    activity:req.query.assignment,
                    user:user.id,
                    activityBy:req.user.id,
                    activityDate:new Date (Date.now())
                };

                affectedAssets[0].assetActivityHistory.push(objActivity);
                await affectedAssets[0].save();
            
                // userLogSave(user, newIdArr, req.query.assignment, req);
                userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
         //End of Log

            
        }

        if (req.query.assignment == 'Approve'){
            console.log('Approve now');
            
            let affectedAssetType = await assetTypeModel.find().where('_id').in(userAssetArr.idArr).select('_id assetTypeQty assetTypeImageName assetTypeDescription assetTypeClass').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetCode assetType assetName status assetUserHistory assetLocationHistory assetActivityHistory allocationStatus').exec();

           
        
                                // console.log('This is affectedType (approve), ', affectedAssetType);
                                console.log('This is affected assets (approve), ', affectedAssets);
                                affectedAssetType.forEach(assetTypeId=>{
                                    console.log('Now Approve',assetTypeId._id.toString());
                                    var assetTypeIdTrim = assetTypeId._id.toString();
                                    affectedAssetTypeObj[assetTypeIdTrim] = 0;
                                })
                                console.log('--------');
                                affectedAssetType.forEach(assetTypeId=>{
                                    var assetTypeIdTrim = assetTypeId._id.toString();//.slice(assetTypeId._id.toString().indexOf('"')+1, assetTypeId._id.toString().lastIndexOf('"')+1)
                                    console.log(assetTypeIdTrim);
                                    affectedAssetTypeObj[assetTypeIdTrim] = userAssetArrIdArrObj[assetTypeIdTrim];
                                })
        
                            console.log('This is affectedAssetTypeObj (approve), ', affectedAssetTypeObj);
                            
                            //Decrement assetTypeQty
                                            affectedAssetType.forEach(async (assetType, i)=>{
                                                // console.log('Witin each...');
                                            
                                                //Shift this to store allocation, or on receipt;
                                                // assetType.assetTypeQty -= affectedAssetTypeObj[assetType._id];
                                                // await assetType.save();
                                            });
        
                            //create assets
                                            let affectedAssetType2 = affectedAssetType.map(asset=>{
                                                return asset._id.toString();
                                            })
                                            console.log('This is mapped affectedAssetType (approve) ', affectedAssetType2);

                                            for (const assetToApprove of affectedAssets){
                                                    console.log('Into directorate assets')
                                                if (assetToApprove.assetCode !== '0012'){ 
                                                    //don't assign uuid.  It has already.
                                                    console.log('Has UUID', assetToApprove.assetCode);
                                                }else{
                                                    assetToApprove.assetCode = uuidv4(); //assign uuid 
                                                    console.log('Assigned uuid');
                                                }
                                                    assetToApprove.assetStatus = 'Assigned';
                                                    assetToApprove.assetAllocationStatus = true;

                                                    assetToApprove.assetUserHistory.push(user.id);
                                                    assetToApprove.assetLocationHistory.push(user.id);
                                                    assetToApprove.assetApproval = {
                                                        ownApproval:'approved',
                                                        stateApproval:'approved',
                                                        directorateApproval:null,
                                                        storeApproval:null,
                                                        issuerApproval:null
                                                    };

                                                    let approvedAsset = await assetToApprove.save();
                                                    // console.log('This is approvedAsset ', approvedAsset);

                                                    newIdArr.push(await approvedAsset._id); //for use in userLogSave()
                                                    
                                                    //We have to push asset ids
                                                    user.approvedUserAsset.id.push(assetToApprove.id);
                                                    user.approvedUserAsset.idType.push(assetToApprove.assetName);
                                            }
                        // for (const itemId of userAssetArr.idArr){

                                            console.log('This is newIdArr for directorate approver ', newIdArr)
                                            // let stateApprover = await userModel.find({}).where('userRole.role').equals('stateApproval').where('userRole.domain').equals(user.state);
                                            let directorateApprover = await userModel.find({}).where('userRole.role').equals('directorateApproval').where('userRole.domain').equals(user.directorate);
                                                   
                                                    let userObj = {
                                                        id:user._id,
                                                        approvedAssets:newIdArr
                                                    }
                                            // let stateApprov = await (await userModel.find({}).where([[stateApprover[0].userRole.usersToApprove].approvedAssets])).includes
                                            console.log('Directorate approver is ', directorateApprover);
                                            directorateApprover[0].userRole.usersToApprove.push(userObj);
                                              await directorateApprover[0].save();  
                                              
                                              let updatedUser = await user.save();
                                              // console.log('Updated user ', updatedUser);
                                              
                                              console.log('Pushed to directorateApproval--');
                                              console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
                                              console.log('directorateApprover', directorateApprover[0]);
                                        redirectUser = userAssetArr.approvingUserId;
                                         //Log
                                                let objActivity = {
                                                    activity:req.query.assignment,
                                                    user:user.id,
                                                    activityBy:req.user.id,
                                                    activityDate:new Date (Date.now())
                                                };

                                                affectedAssets[0].assetActivityHistory.push(objActivity);
                                                await affectedAssets[0].save();
                                            
                                                // userLogSave(user, newIdArr, req.query.assignment, req);
                                                // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                                                userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                                                userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
                                        //End of Log
    
        }

        if (req.query.assignment == 'DeApprove'){
            //takes only ticked items from own list and subtracts it from user asset (user.userAsset.id)

            console.log('DeApprove now');
           
            user.approvedUserAsset.id.forEach(item=>{
                if(userAssetArr.idArr.indexOf((item.toString())) == -1){
                    newIdArr.push(item);
                } //string to mongoose.Types.ObjectId.  How to
            })
            let directorateApprover = await userModel.find({}).where('userRole.role').equals('directorateApproval').where('userRole.domain').equals(user.directorate);

            for (const objItem of directorateApprover[0].userRole.usersToApprove){
                objItem.approvedAssets.forEach((asset,i)=>{
                // for (asset of objItem.approvedAssets(asset,i)=>{
                    console.log('second foreach directorate')
                    if(userAssetArr.idArr.indexOf((asset.toString())) > -1){
                        console.log(objItem.approvedAssets);
                        console.log('Splicing...')
                        objItem.approvedAssets.splice(i,1);
                        console.log(objItem.approvedAssets);
                    }
                })
                
            }
            //Clearing empty applications (applications without assets)
            for (var a=0;a < directorateApprover[0].userRole.usersToApprove.length;a++){
                if (directorateApprover[0].userRole.usersToApprove[a].approvedAssets.length ==0){
                    directorateApprover[0].userRole.usersToApprove.splice(a,1); 
                }
            }
           await directorateApprover[0].save();


    //userAssetArr.idArr //items to deAssign

            //reassign updated assetIds to user
            user.approvedUserAsset.id= newIdArr;
            let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus assetActivityHistory').exec();

            //return affected Assets to Asset pool (used)
            //This will be in each approval stage
            affectedAssets.forEach(async asset=>{
                // asset.assetAllocationStatus = false;
                // asset.assetApproval = {
                //     self:'approved',
                //     state:null,
                //     directorate:null,
                //     store:null,
                //     issue:null
                // };
                asset.assetApproval ={
                    ownApproval:'approved',
                    stateApproval:null,
                    directorateApproval:null,
                    storeApproval:null,
                    issuerApproval:null
                };
                await asset.save();
            })
            var assetTypeArr = [];
            assetsNamesToAssign.forEach(asset=>{
                asset.assetAllocationStatus = false; //we have to bring false assets and store them under their asset Divs as used items
                // asset.assetApproval.state = null;
                    // assetTypeArr.push(asset.assetType); //or asset.assetName?
                assetTypeArr.push(asset.assetName); //or asset.assetName?
            })

            //reassign updated assetId types to user
            user.approvedUserAsset.idType = assetTypeArr; //very correct
            console.log('1--');
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            redirectUser = userAssetArr.approvingUserId; //redirecting back to... State Approver?
            //Log
                    let objActivity = {
                        activity:req.query.assignment,
                        user:user.id,
                        activityBy:req.user.id,
                        activityDate:new Date (Date.now())
                    };

                    affectedAssets[0].assetActivityHistory.push(objActivity);
                    await affectedAssets[0].save();
                
                    // userLogSave(user, newIdArr, req.query.assignment, req);
                    // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                    // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                    userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
                    userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
            //End of Log
            
        }

        if (req.query.assignment == 'D.Approve'){
            console.log('Directorate Approval now');
            
            //is this first line not useless? It won't give anything.
            let affectedAssetType = await assetTypeModel.find().where('_id').in(userAssetArr.idArr).select('_id assetTypeQty assetTypeImageName assetTypeDescription assetTypeClass').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetCode assetType assetName status assetUserHistory assetLocationHistory allocationStatus assetActivityHistory').exec();

           
        
                                // console.log('This is affectedType (approve), ', affectedAssetType);
                                // affectedAssetType, appears to be to reduce AssetType quantity. It should be only in Store Approval
                                console.log('This is affected assets (DApprove), ', affectedAssets);
                                affectedAssetType.forEach(assetTypeId=>{
                                    console.log('Now DApprove', assetTypeId._id.toString());
                                    var assetTypeIdTrim = assetTypeId._id.toString();
                                    affectedAssetTypeObj[assetTypeIdTrim] = 0;
                                });

                                console.log('--------');
                                affectedAssetType.forEach(assetTypeId=>{
                                    var assetTypeIdTrim = assetTypeId._id.toString();//.slice(assetTypeId._id.toString().indexOf('"')+1, assetTypeId._id.toString().lastIndexOf('"')+1)
                                    console.log(assetTypeIdTrim);
                                    affectedAssetTypeObj[assetTypeIdTrim] = userAssetArrIdArrObj[assetTypeIdTrim];
                                })
        
                            console.log('This is affectedAssetTypeObj (approve), ', affectedAssetTypeObj);
                            
                            //Decrement assetTypeQty
                                            affectedAssetType.forEach(async (assetType, i)=>{
                                                // console.log('Witin each...');
                                            
                                            //At point of receipt
                                                // assetType.assetTypeQty -= affectedAssetTypeObj[assetType._id];
                                                // await assetType.save();
                                            });
        
                            //create assets
                                            let affectedAssetType2 = affectedAssetType.map(asset=>{
                                                return asset._id.toString();
                                            })
                                            console.log('This is mapped affectedAssetType (D.Approve) ', affectedAssetType2);

                                            // affectedAssets.forEach(async assetToApprove=>{
                                            for (const assetToApprove of affectedAssets){

                                            // if (assetToApprove.assetCode !== '0012'){ 
                                                //don't assign uuid.  It has already.
                                                console.log('Has UUID', assetToApprove.assetCode);
                                            // }else{
                                            //     assetToApprove.assetCode = uuidv4(); //assign uuid 
                                            // }
                                                // assetToApprove.assetStatus = 'Assigned';
                                                // assetToApprove.assetAllocationStatus = true;

                                                // assetToApprove.assetUserHistory.push(user.id);
                                                // assetToApprove.assetLocationHistory.push(user.id);
                                                assetToApprove.assetApproval ={
                                                    ownApproval:'approved',
                                                    stateApproval:'approved',
                                                    directorateApproval:'approved',
                                                    storeApproval:null,
                                                    issuerApproval:null
                                                };
                                                let approvedAsset = await assetToApprove.save();
                                                console.log('This is approvedAsset ', approvedAsset);
                                                newIdArr.push(await approvedAsset._id);

                                                user.directorateApprovedUserAsset.id.push(assetToApprove.id);
                                                user.directorateApprovedUserAsset.idType.push(assetToApprove.assetName);
                                            }
                                            let storeApprover = await userModel.find({}).where('userRole.role').equals('storeApproval');//.where('userRole.domain').equals(user.directorate);
                                            console.log('storeApprover', storeApprover[0]);
                                            console.log('This is newIdArr for storeApprover ', newIdArr);
                                            let userObj = {
                                                id:user._id,
                                                approvedAssets:newIdArr
                                            }
                                            // storeApprover[0].userRole.usersToApprove.push(user._id); 
                                            storeApprover[0].userRole.usersToApprove.push(userObj); 
                                            await storeApprover[0].save();
                                
                                // redirectUser = storeApprover[0].id
                                redirectUser = userAssetArr.approvingUserId;
                            
                                            console.log('Pushed to storeApproval--');
                                            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);


                                            let updatedUser = await user.save();
                                            console.log('Updated user ', updatedUser);
                                           
            console.log('2--');
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            //Log
            let objActivity = {
                activity:req.query.assignment,
                user:user.id,
                activityBy:req.user.id,
                activityDate:new Date (Date.now())
            };

            affectedAssets[0].assetActivityHistory.push(objActivity);
            await affectedAssets[0].save();
        
            // userLogSave(user, newIdArr, req.query.assignment, req);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
    //End of Log
    
        }

        if (req.query.assignment == 'D.DeApprove'){
            //takes only ticked items from own list and subtracts it from user asset (user.userAsset.id)

            console.log('Directorate DeApproval now');
           
            user.directorateApprovedUserAsset.id.forEach(item=>{
                if(userAssetArr.idArr.indexOf((item.toString())) == -1){
                    newIdArr.push(item);
                } //string to mongoose.Types.ObjectId.  How to
            })

            let storeApprover = await userModel.find({}).where('userRole.role').equals('storeApproval');//.where('userRole.domain').equals(user.directorate);

            for (const objItem of storeApprover[0].userRole.usersToApprove){
                objItem.approvedAssets.forEach((asset,i)=>{
                // for (asset of objItem.approvedAssets(asset,i)=>{
                    console.log('second foreach')
                    if(userAssetArr.idArr.indexOf((asset.toString())) > -1){
                        console.log(objItem.approvedAssets);
                        console.log('Splicing...')
                        objItem.approvedAssets.splice(i,1);
                        console.log(objItem.approvedAssets);
                    }
                })
                
            }
            //Clearing empty applications (applications without assets)
            for (var a=0;a < storeApprover[0].userRole.usersToApprove.length;a++){
                if (storeApprover[0].userRole.usersToApprove[a].approvedAssets.length ==0){
                    storeApprover[0].userRole.usersToApprove.splice(a,1); 
                }
            }
           await storeApprover[0].save();


    //userAssetArr.idArr //items to deAssign

            //reassign updated assetIds to user
            user.directorateApprovedUserAsset.id= newIdArr;
            let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus assetActivityHistory').exec();

            //return affected Assets to Asset pool (used)
            //This will be in each approval stage
            affectedAssets.forEach(async asset=>{
                // asset.assetAllocationStatus = false;
                // asset.assetApproval ={
                //     self:'approved',
                //     state:'approved',
                //     directorate:null,
                //     store:null,
                //     issue:null
                // };
                asset.assetApproval ={
                    ownApproval:'approved',
                    stateApproval:'approved',
                    directorateApproval:null,
                    storeApproval:null,
                    issuerApproval:null
                };
                await asset.save();
            })
            var assetTypeArr = [];
            assetsNamesToAssign.forEach(asset=>{
                asset.assetAllocationStatus = false; //we have to bring false assets and store them under their asset Divs as used items
                
                // assetTypeArr.push(asset.assetType); //or asset.assetName?
                assetTypeArr.push(asset.assetName); //or asset.assetName?
            })

            //reassign updated assetId types to user
            user.directorateApprovedUserAsset.idType = assetTypeArr; //very correct
            console.log('3--');
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            redirectUser = userAssetArr.approvingUserId; //redirecting back to... State Approver?
            //Log
            let objActivity = {
                activity:req.query.assignment,
                user:user.id,
                activityBy:req.user.id,
                activityDate:new Date (Date.now())
            };

            affectedAssets[0].assetActivityHistory.push(objActivity);
            await affectedAssets[0].save();
        
            // userLogSave(user, newIdArr, req.query.assignment, req);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
    //End of Log
        }

        if (req.query.assignment == 'Store.Approve'){

            userAssetArrIdArrObj = {}; //resetting
            userAssetArr.idTypeArr.forEach(assetTypeId=>{
                userAssetArrIdArrObj[assetTypeId] = 0;
            })

            userAssetArr.idTypeArr.forEach(assetId=>{
                // assetId = assetId.slice(assetId.indexOf('"')+1, assetId.lastIndexOf('"'))
                userAssetArrIdArrObj[assetId]++;
            })

            console.log('Store Approval now');
            console.log('Decrement Store Quantities here');
            
            // let affectedAssetType = await assetTypeModel.find().where('_id').in(userAssetArr.idArr).select('_id assetTypeQty assetTypeImageName assetTypeDescription assetTypeClass').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetCode assetType assetName status assetUserHistory assetLocationHistory allocationStatus assetActivityHistory').exec();
            let affectedAssetsTypes = await assetTypeModel.find().where('_id').in(userAssetArr.idTypeArr).select('assetTypeCode assetTypeClass assetTypeQty').exec();

           
        
                                // console.log('This is affectedType (approve), ', affectedAssetType);
                                // affectedAssetType, appears to be to reduce AssetType quantity. It should be only in Store Approval
                                console.log('This is affected assets (Store.Approve), ', affectedAssets);
                                affectedAssetsTypes.forEach(assetTypeId=>{
                                    console.log('Now DApprove', assetTypeId._id.toString());
                                    var assetTypeIdTrim = assetTypeId._id.toString();
                                    affectedAssetTypeObj[assetTypeIdTrim] = 0;
                                });

                                console.log('--------');
                                affectedAssetsTypes.forEach(assetTypeId=>{
                                    var assetTypeIdTrim = assetTypeId._id.toString();//.slice(assetTypeId._id.toString().indexOf('"')+1, assetTypeId._id.toString().lastIndexOf('"')+1)
                                    console.log(assetTypeIdTrim);
                                    affectedAssetTypeObj[assetTypeIdTrim] = userAssetArrIdArrObj[assetTypeIdTrim];
                                })
        
                            console.log('This is affectedAssetTypeObj (Store Approve), ', affectedAssetTypeObj);
                            
                            //Decrement assetTypeQty
                                    affectedAssetsTypes.forEach(async (assetType, i)=>{
                                        // console.log('Witin each...');
                                        assetType.assetTypeQty -= affectedAssetTypeObj[assetType._id.toString()];
                                        await assetType.save();
                                    });
        
                            //create assets
                                            let affectedAssetType2 = affectedAssetsTypes.map(asset=>{
                                                return asset._id.toString();
                                            })
                                            console.log('This is mapped affectedAssetType (Store.Approve) ', affectedAssetType2);

                                            // affectedAssets.forEach(async assetToApprove=>{
                                            for (const assetToApprove of affectedAssets){

                                            // if (assetToApprove.assetCode !== '0012'){ 
                                                //don't assign uuid.  It has already.
                                                console.log('Has UUID', assetToApprove.assetCode);
                                            // }else{
                                            //     assetToApprove.assetCode = uuidv4(); //assign uuid 
                                            // }
                                                assetToApprove.assetStatus = 'Assigned'; //sole jurisdiction of Store approval
                                                assetToApprove.assetAllocationStatus = true;
                                            
                                            //This will be reserved for receipt by the user; so
                                                // assetToApprove.assetUserHistory.push(user.id); //sole jurisdiction of user reciept.
                                                // assetToApprove.assetLocationHistory.push(user.id);
                                                assetToApprove.assetApproval ={
                                                    ownApproval:'approved',
                                                    stateApproval:'approved',
                                                    directorateApproval:'approved',
                                                    storeApproval:'approved',
                                                    issuerApproval:null
                                                };
                                                let approvedAsset = await assetToApprove.save();
                                                console.log('This is approvedAsset ', approvedAsset);

                                                newIdArr.push(await approvedAsset._id);
                                                user.storeApprovedUserAsset.id.push(assetToApprove.id);
                                                user.storeApprovedUserAsset.idType.push(assetToApprove.assetName);
                                            }
                                            let userAssetOwned = JSON.parse(JSON.stringify(user.userAsset));

                                            //final owned assets
                                            user.userOwnedAsset = userAssetOwned;

                                            let updatedUser = await user.save();
                                            console.log('Updated user ', updatedUser);
                                            
                                            console.log('This is newIdArr for issuerApprover ', newIdArr);
                                            
                                            //bring in next user;and redirect to original approving officer here                              
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            let issuerApprover = await userModel.find({}).where('userRole.role').equals('issuerApproval');//.where('userRole.domain').equals(user.directorate);
            console.log('issuerApprover', issuerApprover[0]);

                   
                    let userObj = {
                        id:user._id,
                        approvedAssets:newIdArr
                    }

            issuerApprover[0].userRole.usersToApprove.push(userObj);
            await issuerApprover[0].save();
            redirectUser = userAssetArr.approvingUserId; //redirecting back to... State Approver?
            //Log
            let objActivity = {
                activity:req.query.assignment,
                user:user.id,
                activityBy:req.user.id,
                activityDate:new Date (Date.now())
            };

            affectedAssets[0].assetActivityHistory.push(objActivity);
            await affectedAssets[0].save();
        
            // userLogSave(user, newIdArr, req.query.assignment, req);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
    //End of Log
        }


        if (req.query.assignment == 'Store.DeApprove'){
            //takes only ticked items from own list and subtracts it from user asset (user.userAsset.id)
            
            console.log('Directorate DeApproval now');
            console.log(userAssetArr.idArr);
           
            user.storeApprovedUserAsset.id.forEach(item=>{
                if(userAssetArr.idArr.indexOf((item.toString())) == -1){
                    newIdArr.push(item);
                } //string to mongoose.Types.ObjectId.  How to
            })

            let issuerApprover = await userModel.find({}).where('userRole.role').equals('issuerApproval');//.where('userRole.domain').equals(user.directorate);
            for (const objItem of issuerApprover[0].userRole.usersToApprove){
                objItem.approvedAssets.forEach((asset,i)=>{
                // for (asset of objItem.approvedAssets(asset,i)=>{
                    console.log('second foreach')
                    if(userAssetArr.idArr.indexOf((asset.toString())) > -1){
                        console.log(objItem.approvedAssets);
                        console.log('Splicing...')
                        objItem.approvedAssets.splice(i,1);
                        console.log(objItem.approvedAssets);
                    }
                })
                
            }
            //Clearing empty applications (applications without assets)
            for (var a=0;a < issuerApprover[0].userRole.usersToApprove.length;a++){
                if (issuerApprover[0].userRole.usersToApprove[a].approvedAssets.length ==0){
                    issuerApprover[0].userRole.usersToApprove.splice(a,1); 
                }
            }
           await issuerApprover[0].save();


    //userAssetArr.idArr //items to deAssign

            //reassign updated assetIds to user
            user.storeApprovedUserAsset.id= newIdArr;
            let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus assetActivityHistory assetActivityHistory').exec();

                //using assetType now, not asset
                userAssetArr.idTypeArr.forEach(assetId=>{
                    userAssetArrIdArrObj[assetId] = 0;
                })

                //incrementing
                userAssetArr.idTypeArr.forEach(assetId=>{
                    // assetId = assetId.slice(assetId.indexOf('"')+1, assetId.lastIndexOf('"'))
                    userAssetArrIdArrObj[assetId]++;
                })
                
            //Restoring asset quantity
            let affectedAssetType = await assetTypeModel.find().where('_id').in(userAssetArr.idTypeArr).select('_id assetTypeQty assetTypeImageName assetTypeDescription assetTypeClass').exec();
                    
                
            console.log('This is affectedType, ', affectedAssetType);
            //initializing
            affectedAssetType.forEach(assetTypeId=>{
                console.log('Now ',assetTypeId._id.toString());
                var assetTypeIdTrim = assetTypeId._id.toString();
                affectedAssetTypeObj[assetTypeIdTrim] = 0;
            })
            console.log('--------');
            affectedAssetType.forEach(assetTypeId=>{
                var assetTypeIdTrim = assetTypeId._id.toString();//.slice(assetTypeId._id.toString().indexOf('"')+1, assetTypeId._id.toString().lastIndexOf('"')+1)
                console.log(assetTypeIdTrim);
                affectedAssetTypeObj[assetTypeIdTrim] = userAssetArrIdArrObj[assetTypeIdTrim];
            })

        console.log('This is affectedAssetTypeObj, ', affectedAssetTypeObj); //is it not the same as userAssetArrIdArrObj?
            // affectedAssetType.forEach(async (assetType, i)=>{
            for (assetType of affectedAssetType) {
                console.log('Restoring Quantity... from ', assetType.assetTypeQty);
                assetType.assetTypeQty += affectedAssetTypeObj[assetType._id];
                console.log('...to ', assetType.assetTypeQty);
                
                await assetType.save();
                // console.log(typeof assetType.assetTypeQty)
                // console.log(typeof affectedAssetTypeObj[assetType._id])
                // console.log(assetType.assetTypeQty);
                // console.log('assetType saved', assetType);
            // });
            };



            //

            //return affected Assets to Asset pool (used)
            //This will be in each approval stage
            affectedAssets.forEach(async asset=>{
                // asset.assetAllocationStatus = false;

                // asset.assetApproval= {
                //     self:'approved',
                //     state:'approved',
                //     directorate:'approved',
                //     store:null,
                //     issue:null
                // };

                asset.assetApproval ={
                    ownApproval:'approved',
                    stateApproval:'approved',
                    directorateApproval:'approved',
                    storeApproval:null,
                    issuerApproval:null
                };
                await asset.save();
            })
            var assetTypeArr = [];
            assetsNamesToAssign.forEach(asset=>{
                asset.assetAllocationStatus = false; //we have to bring false assets and store them under their asset Divs as used items
                
                // assetTypeArr.push(asset.assetType); //or asset.assetName?
                assetTypeArr.push(asset.assetName); //or asset.assetName?
            })

            //reassign updated assetId types to user
            user.storeApprovedUserAsset.idType = assetTypeArr; //very correct
            console.log('3--');
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            redirectUser = userAssetArr.approvingUserId; //redirecting back to... State Approver?
            console.log('STore: this is approving userID: ', redirectUser);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            
            
                
            // console.log('This is assetTypeNamesTo increment quantity, ', affectedAssetsTypes);
            //Log
            let objActivity = {
                activity:req.query.assignment,
                user:user.id,
                activityBy:req.user.id,
                activityDate:new Date (Date.now())
            };

            affectedAssets[0].assetActivityHistory.push(objActivity);
            await affectedAssets[0].save();
        
            // userLogSave(user, newIdArr, req.query.assignment, req);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
    //End of Log

            
        }

        if (req.query.assignment == 'Issuer.Approve'){

            userAssetArrIdArrObj = {}; //resetting
            userAssetArr.idTypeArr.forEach(assetTypeId=>{
                userAssetArrIdArrObj[assetTypeId] = 0;
            })

            userAssetArr.idTypeArr.forEach(assetId=>{
                // assetId = assetId.slice(assetId.indexOf('"')+1, assetId.lastIndexOf('"'))
                userAssetArrIdArrObj[assetId]++;
            })

            console.log('Issue Approval now');
            console.log('Decrement Store Quantities here');
            
            // let affectedAssetType = await assetTypeModel.find().where('_id').in(userAssetArr.idArr).select('_id assetTypeQty assetTypeImageName assetTypeDescription assetTypeClass').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetCode assetType assetName status assetUserHistory assetLocationHistory allocationStatus assetActivityHistory').exec();
            let affectedAssetsTypes = await assetTypeModel.find().where('_id').in(userAssetArr.idTypeArr).select('assetTypeCode assetTypeClass assetTypeQty').exec();

           
        
                                // console.log('This is affectedType (approve), ', affectedAssetType);
                                // affectedAssetType, appears to be to reduce AssetType quantity. It should be only in Store Approval
                                console.log('This is affected assets (Store.Approve), ', affectedAssets);
                                affectedAssetsTypes.forEach(assetTypeId=>{
                                    console.log('Now Issued', assetTypeId._id.toString());
                                    var assetTypeIdTrim = assetTypeId._id.toString();
                                    affectedAssetTypeObj[assetTypeIdTrim] = 0;
                                });

                                console.log('--------');
                                affectedAssetsTypes.forEach(assetTypeId=>{
                                    var assetTypeIdTrim = assetTypeId._id.toString();//.slice(assetTypeId._id.toString().indexOf('"')+1, assetTypeId._id.toString().lastIndexOf('"')+1)
                                    console.log(assetTypeIdTrim);
                                    affectedAssetTypeObj[assetTypeIdTrim] = userAssetArrIdArrObj[assetTypeIdTrim];
                                })
        
                            console.log('This is affectedAssetTypeObj (Store Approve), ', affectedAssetTypeObj);
                            
                            //Decrement assetTypeQty
                                    affectedAssetsTypes.forEach(async (assetType, i)=>{
                                                // console.log('Witin each...');
                                                // assetType.assetTypeQty -= affectedAssetTypeObj[assetType._id.toString()];
                                                // await assetType.save();
                                            });
        
                            //create assets
                                            let affectedAssetType2 = affectedAssetsTypes.map(asset=>{
                                                return asset._id.toString();
                                            })
                                            console.log('This is mapped affectedAssetType (Store.Approve) ', affectedAssetType2);

                                            for (const assetToApprove of affectedAssets){

                                            // affectedAssets.forEach(async assetToApprove=>{
                                            // if (assetToApprove.assetCode !== '0012'){ 
                                                //don't assign uuid.  It has already.
                                                console.log('Has UUID', assetToApprove.assetCode);
                                            // }else{
                                            //     assetToApprove.assetCode = uuidv4(); //assign uuid 
                                            // }
                                                // assetToApprove.assetStatus = 'Assigned'; //sole jurisdiction of Store approval
                                                // assetToApprove.assetAllocationStatus = true;
                                            
                                            //This will be reserved for receipt by the user; so
                                                // assetToApprove.assetUserHistory.push(user.id); //sole jurisdiction of user reciept.
                                                // assetToApprove.assetLocationHistory.push(user.id);
                                                
                                                assetToApprove.assetApproval = {
                                                    ownApproval:'approved',
                                                    stateApproval:'approved',
                                                    directorateApproval:'approved',
                                                    storeApproval:'approved',
                                                    issuerApproval:'approved'
                                                };

                                                let approvedAsset = await assetToApprove.save();
                                                // console.log('This is IssueApprovedAsset ', approvedAsset);
                                                user.issueApprovedUserAsset.id.push(assetToApprove.id);
                                                user.issueApprovedUserAsset.idType.push(assetToApprove.assetName);
                                                console.log('Pushed to issueApprovedUserAsset');
                                            }
                                            let updatedUser = await user.save();
                                            console.log('Updated user with issued ', updatedUser);
             
                                            //bring in next user;and redirect to original approving officer here                              
            console.log('4--');
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            // let issuerApprover = await userModel.find({}).where('userRole.role').equals('storeApproval');//.where('userRole.domain').equals(user.directorate);
            // console.log('issuerApprover', issuerApprover[0]);
            // issuerApprover[0].userRole.usersToApprove.push(user._id);
            // await issuerApprover[0].save();
            redirectUser = userAssetArr.approvingUserId; //redirecting back to... State Approver?
            //Log
            let objActivity = {
                activity:req.query.assignment,
                user:user.id,
                activityBy:req.user.id,
                activityDate:new Date (Date.now())
            };

            affectedAssets[0].assetActivityHistory.push(objActivity);
            await affectedAssets[0].save();
        
            // userLogSave(user, newIdArr, req.query.assignment, req);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
    //End of Log
        }

        
        if (req.query.assignment == 'Issuer.DeApprove'){
             
            //takes only ticked items from own list and subtracts it from user asset (user.userAsset.id)

            console.log('Directorate DeApproval now');
           
            user.issueApprovedUserAsset.id.forEach(item=>{
                if(userAssetArr.idArr.indexOf((item.toString())) == -1){
                    newIdArr.push(item);
                } //string to mongoose.Types.ObjectId.  How to
            })

    //userAssetArr.idArr //items to deAssign

            //reassign updated assetIds to user
            user.issueApprovedUserAsset.id= newIdArr;
            let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus').exec();
            let affectedAssets = await assetModel.find().where('_id').in(userAssetArr.idArr).select('assetType status allocationStatus assetActivityHistory').exec();

            //return affected Assets to Asset pool (used)
            //This will be in each approval stage
            affectedAssets.forEach(async asset=>{
                // asset.assetAllocationStatus = false;
                // asset.assetApproval = {
                //     self:'approved',
                //     state:'approved',
                //     directorate:'approved',
                //     store:'approved',
                //     issue:null
                // };

                asset.assetApproval ={
                    ownApproval:'approved',
                    stateApproval:'approved',
                    directorateApproval:'approved',
                    storeApproval:'approved',
                    issuerApproval:null
                };
                await asset.save();
            })
            var assetTypeArr = [];
            assetsNamesToAssign.forEach(asset=>{
                asset.assetAllocationStatus = false; //we have to bring false assets and store them under their asset Divs as used items
                // assetTypeArr.push(asset.assetType); //or asset.assetName?
                assetTypeArr.push(asset.assetName); //or asset.assetName?
            })

            //reassign updated assetId types to user
            user.issueApprovedUserAsset.idType = assetTypeArr; //very correct
            console.log('Issue DeApprove2-');
            console.log('This is userAssetArr.idArr right before log: ', userAssetArr.idArr);
            redirectUser = userAssetArr.approvingUserId; //redirecting back to... State Approver?
            console.log('STore: this is approving userID: ', redirectUser);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            
            
                
            // console.log('This is assetTypeNamesTo increment quantity, ', affectedAssetsTypes);

            //Log
            let objActivity = {
                activity:req.query.assignment,
                user:user.id,
                activityBy:req.user.id,
                activityDate:new Date (Date.now())
            };

            affectedAssets[0].assetActivityHistory.push(objActivity);
            await affectedAssets[0].save();
        
            // userLogSave(user, newIdArr, req.query.assignment, req);
            // userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave(user, userAssetArr.idArr, req.query.assignment, req);
            userLogSave2(user, userAssetArr.idArr, req.query.assignment, req); //modern log
    //End of Log
            console.log('Issued now...');
            
        }

       
        console.log('Here is new arr++++++++++++');
       
        // console.log('This is user, ', user)
        await user.save();
        console.log('And this is the user approved for', user)

        msg = {
            message:'User Asset updated!',
            class:'green'
        };
        
        // userLogSave(user, newIdArr, req.query.assignment, req);
        // res.redirect(`/user/${userAssetArr.userId}`);
        // if (req.query.assignment == 'Store.Approve'){
        //     res.render(`user/issuingApproval`);
        // }else{
            res.redirect(`/user/${redirectUser}`);
        // }
        
    } catch(e){
        console.log(e.message);
    }
});

route.post('/masa', (req, res)=>{
    console.log('Hitting now...')
})

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
    console.log('Asset for directorate approval (directorate)', assetRequisitioned);
    let userId = req.params.id;
    try{
        let user = await userModel.findById(userId).select('firstName lastName cadre rank directorate approvalStatus userEmail');

        let userStoreApprover = await userModel.find().where('userRole').equals('storeApproval').where('approvalStatus').in([user.directorate, 'All'])
        userStoreApprover[0].userStoreApproval.push(user);
        await userStoreApprover[0].save();
        userLogSave(user, assetRequisitioned, req.query.assignment, req);

                            // function notifyUser(user){
                        io.on('connection', socket=>{
                            console.log('This is socket (directorate) ', socket.id);
                            io.emit('DirectorateApproval', 'Directorate Approval'); //or is io socket?
                                console.log('Emitt');
                            socket.on('join-room', (id, room, cb)=>{
                                console.log(`${id} of socket ${socket.id} is joining room ${room}`)
                                socket.join(room);
                                console.log('user.userEmail: ', user.userEmail);
                                console.log('id: ', id);
                                if (user.userEmail === id){
                                    console.log('Equal');
                                    cb(`${id} joined room`);
                                }
                                // socket.emit('room-joined', `${id} joined room`)
                            })
                        })
                    // }
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

route.get('/requisitionApproval/:id', async (req, res)=>{
   

// async..await is not allowed in global scope, must use a wrapper
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'phyBSTBenaiah@gmail.com', // generated ethereal user
      pass: 'phyBST71', // generated ethereal password
    },
    tls:{
        rejectUnauthorized:false
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <phyBSTBenaiah@gmail.com>', // sender address
    to: "yadeiza@yahoo.co.uk", // list of receivers
    subject: "Notification of Approval", // Subject line
    text: "Your asset application has passed Directorate Approaval now", // plain text body
    html: "<b>This is working good!</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...


main().catch(console.error);
    res.send('Forwarded for approval: ');
});


route.delete('/:id', authenticateRoleProfilePage(), async(req,res)=>{
    // console.log('Deleting...');
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
        console.log('This is error: ');
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
        assetType:req.body.assetTypeName,
        userEmail:req.user.email
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
                console.log('@@')
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



route.get('/audit', hideNavMenu(), (req, res)=>{
    res.render('./user/audit.ejs')
})

route.get('/audit2', hideNavMenu(), (req, res)=>{
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

route.get('/callHistory/:userId', async (req, res)=>{
    try {
        console.log(req.params.userId);
        let userHistory = await userLogModel2.find({}).where('userId').equals(req.params.userId);
        // res.status(200).json({msg:userHistory});
        res.send({msg:userHistory});
    }catch(e){
        console.log(e.message);
    }
})


module.exports = route;
