let {userLogSave, userLogSave2} = require('../utilFile');

const {instrument} = require('@socket.io/admin-ui');

let express = require('express');
let app = express();
let route = express.Router();

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');

let assetModel = require('../models/asset.js');
let assetTypeModel = require('../models/assetType.js');
// const { rawListeners } = require('../models/asset.js');
const userModel = require('../models/user.js');
const userLogModel = require('../models/userLog.js');
const userLogModel2 = require('../models/userLog2.js');
let {v4:uuidv4} = require('uuid');
//route.set('layout', 'layouts/layout');
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors:
    {
    //    origin:['http://localhost:2000']
    //    origin:'https://assetmanger.herokuapp.com/'
    origin:"*"
    }
});
httpServer.listen(3000);

// const io = require('socket.io')(2001, {
//     cors:
//     {
//     //    origin:['http://localhost:2000']
//        origin:'*'
//     }
// });

let adminSocket;
let adminAvailable;
let driverAvailable;
let adminSocketVar;
let adminAvailableLightUp;


io.on('connection', socket=>{
    console.log('Connected...')
    // get adminMonitoringTracking
    socket.on('adminMonitoringTracking', (msg)=>{
        //join other sockets to this room
        console.log(msg)
        //assign variable to admin socket
        adminSocket = socket.id;
        console.log(adminSocket);

        io.emit('trackPlots', `Tracking... ${socket.id}`);
    })

    console.log('Connected now in 2001 on ', socket.id);
    // (function (adminSocket){
    socket.on('sendPos', (posMsg, room)=>{
        console.log(`here is message ${posMsg}`);
        console.log(`This is adminSocket ${adminSocket}`);
        if (adminSocket){
            console.log('...to admin now...')
            socket.to(adminSocket).emit('dutyOn', posMsg );
        }
    });
    socket.on('stopSendPos', (assetCodeMsg)=>{
        console.log('Stop ', assetCodeMsg);
        socket.to(adminSocket).emit('stopDutyOn', assetCodeMsg.assetCode );

    })

    //for video use
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId);
        if(userId.user !== 'admin'){ //joining from trackable asset
            console.log('Enabling Track Button...')
            if (adminAvailableLightUp){
                console.log('Enable Track Button...')
                console.log(socket.id);
                console.log(socket.rooms);
                // io.to(roomId).emit('enableTrackBut');
                try{
                    // socket.emit('enableTrackBut', 'Enabled' )
                    socket.emit('enableTrackBut', 'Enabled' )
                    console.log('Has it called?');
                }catch(msg){
                    console.log(msg);
                }
            }
            socket.to(roomId).emit('enableTrackBut', 'Enabled' )

        } else{ //joining from overview national
            console.log('Admin');
            adminAvailableLightUp = true;
        }
        console.log('Socket id ', socket.id, 'Joined', roomId, ' on ', userId);
        // socket.broadcast.to(roomId).emit('user-joined', userId)
        
        // if(userId.user == 'admin'){
        //     console.log('Admin joined')
        //     adminAvailable = true
        //     if (driverAvailable){
        //         console.log('Driver is available');
        //         socket.broadcast.to(roomId).emit('readyLight', userId);
        //     }
        //     console.log('Broadcasting socket: ', socket.id);
        // }else{
        //     console.log('Driver joined...')
        //     console.log('Broadcasting socket: ', socket.id);
        //     driverAvailable = true;
        //     if (adminAvailable){
        //         console.log('Broadcasting socket (with admin): ', socket.id);
        //         socket.broadcast.to(roomId).emit('readyLight', userId);
        //         // socket.emit('readyLight', userId);
        //         io.to(socket.id).emit('readyLight', userId);
        //     }
        // }

        socket.on('ready', (cb)=>{
            console.log('Called ready with socket ', socket.id);
            console.log(`${socket.id} is in ${socket.rooms} room`)
            if(userId.user == 'admin'){
                adminAvailable = true
                console.log(`From admin ${userId}`);
                console.log('This is roomId in ready ', roomId);
                socket.broadcast.to(roomId).emit('user-joined', userId, roomId)
                // socket.to(roomId).emit('readyLight', userId);
                adminSocketVar = socket;

            }else{
                console.log(`From Driver now... ${userId}`);
                cb('brown');
                socket.broadcast.to(roomId).emit('user-joined', userId)
                if (adminAvailable){

                adminSocketVar.broadcast.to(roomId).emit('user-joined', userId, roomId)
                    console.log('Admin is ', adminAvailable);
                    console.log('Number of clients joined: ', io.sockets.adapter.rooms.size);
                    let numOfClients = io.sockets.adapter.rooms.size;
                    socket.to(roomId).emit('readyLight', userId, roomId, io.sockets.adapter.rooms.size);
                    console.log(`Admin to ${socket.id}`);
                    adminSocketVar.to(socket.id).emit('readyLight', userId);
                    console.log(`Admin2 to ${socket.id}`);
                    // socket.to(roomId).emit('user-joined', userId)
                }

            }
        });

        // socket. //join room Number
        
        socket.on('disconnect', ()=>{
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })

    })
    // })(adminSocket)
    
    
    
});


//for use with socket.io admin
instrument(io, { auth: false });


let {permitAssetLists, hideNavMenu} = require('../basicAuth.js'); //permitLists,
const { Router, query } = require('express');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];


route.use(express.static('public'));

//route.use('/user', userRoute);

// route.use(layout);


let userVar = 'trial';

route.put('/updateLocation/:assetId/:assetPosCoord', async (req,res)=>{
    console.log('Posting...', req.params.assetId);
    console.log('Now at ', req.params.assetPosCoord);
    console.log('Now at ', JSON.parse(req.params.assetPosCoord) );
    let positionObj = JSON.parse(req.params.assetPosCoord);
    try{
        let assetNowTracked = await assetModel.find({}).where('_id').equals(req.params.assetId);
            // console.log(assetNowTracked[0]);
            assetNowTracked[0].assetTracked = true;
            assetNowTracked[0].assetTrackedPosition = positionObj;

            
            // console.log(assetNowTracked[0]);
            await assetNowTracked[0].save();
            res.send(JSON.stringify(assetNowTracked[0]));
    }catch(e){
        console.error(e);
    }
    // // let assetlog = await userLogModel.find({}).where('user').equals(req.params.userId).where('userAsset.id').in(req.params.assetId)
    // let assetlog = await userLogModel.find({}).where('userAsset.id').equals(req.params.assetId); //the result will be Assign/DeAssign, as an asset is tracked across many users, and it could not have gone across many users without being severally Assingned and DeAssigned
    // console.log('This is it ', assetlog);
    // res.send(assetlog);
})

route.get('/fromLogAssetDuration/:assetId', async (req,res)=>{
    console.log('Getting...', req.params.assetId);
    // let assetlog = await userLogModel.find({}).where('user').equals(req.params.userId).where('userAsset.id').in(req.params.assetId)
    // try{
        let assetlog = await userLogModel.find({}).where('userAsset.id').equals(req.params.assetId); //the result will be Assign/DeAssign, as an asset is tracked across many users, and it could not have gone across many users without being severally Assingned and DeAssigned
        console.log('This is it ', assetlog);
        res.send(assetlog);
    // }catch(e){
        console.log(e.message);
    // }
})


//get all assets
route.get('/index', permitAssetLists(), hideNavMenu(), async (req, res)=>{ //permitLists()
    console.log('filtering...');
    console.log('Asset delete approval: ', req.assetDeleteAccess);
    let query = req.queryObj
    //query.where('_id').in(req.user.profileId)
    
    let userModelVar = await query.select('firstName userAsset').exec();
    let uniqueAssets = await assetTypeModel.find({}).select('assetTypeClass _id');

    //if you want to do only for assigned assets
                            // console.log('This is uniqueAssets: ', uniqueAssets);
                            // console.log('This is userModelVar: ', userModelVar);
                            // let assetIds = [];
                            // userModelVar.forEach(user=>{
                            //     user.userAsset.id.forEach(assetId=>{
                            //         assetIds.push(assetId.toString())
                            //     })
                            // })

                            // console.log('(((((((((((((Query');
                            // console.log(req.query);
                            // console.log(assetIds)
                            // let assetQuery =  assetModel.find().where('_id').in(assetIds);

    //All assets
    let assetQuery =  assetModel.find().populate('assetType');
    
    if (req.query.assetNameSearch != null && req.query.assetNameSearch != ""){
        assetQuery = assetQuery.regex('assetName', new RegExp(req.query.assetNameSearch, 'i'));
    }
    if (req.query.assetDateBeforeSearch != null && req.query.assetDateBeforeSearch != ""){
        assetQuery = assetQuery.lte('assetAssignDate', req.query.assetDateBeforeSearch);
    }
    if (req.query.assetDateAfterSearch != null && req.query.assetDateAfterSearch != ""){
        assetQuery = assetQuery.gte('assetAssignDate', req.query.assetDateAfterSearch);
    }
    //is this necessary?
    // assetQuery =  assetQuery.where('_id').in(assetIds);
    
    assetModelVar = await assetQuery.exec();
// console.log('This is userModelVar', userModelVar)
console.log('This is assetModelVar', assetModelVar)
// uiSettings = {
//     sideNav:{
//         'regAssetType':'none'
//     }
// }

// let uiSettings = {
//     'onlyAdmin':'none'
// }
console.log('This is req.dispSetting', req.dispSetting);
let uiSettings = req.dispSetting;
    // res.render('./asset/index.ejs', {asset: assetModelVar, searchParams: req.body.searchAssetScope});
    res.render('./asset/index.ejs', {asset: assetModelVar, searchParams: req.query, uiSettings, assetDeleteAccess:req.assetDeleteAccess, uniqueAssets});
    // res.render('./asset/index.ejs');
})

//get the create new form for new asset
route.get('/trial', (req, res)=>{
    console.log('This is asset: ', req.query.asset);
    res.render('asset/trial', {asset:req.query.asset, lngLat: req.query.lngLat});
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
            params.serialNumber = uuidv4();
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
    console.log('Entered here now');
    try {
        const asset = await assetModel.findById(req.params.id).populate('assetType assetUserHistory assetLocationHistory');//.exec();
        console.log('Successful...');
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

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            today = mm + '/' + dd + '/' + yyyy;

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
        asset.assetStatus = req.body.assetStatus;
        asset.assetAssignDate = new Date(); //req.body.assetAssignDate
        asset.assetUser = req.body.user;
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
    console.log('Deleting asset...')
    let asset;
    
    try {
        asset = await assetModel.findById(req.params.id);
        await asset.remove();
        userLogSave(req.user, asset, 'Asset Delete', req);
        userLogSave2(req.user, asset, 'Asset Delete', req); //modern log
        res.redirect("/asset/index");
    } catch(e){
        console.log(e.message);
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
        assetCode: req.body.assetNumber,
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

route.put('/deAssign/:id', async (req, res)=>{
    console.log('DeAssigning...', req.params.id);
    let obj = JSON.parse(req.params.id);
    console.log(obj);
    let newIdArr = [];
    let newIdApprovedUserArr = [];
    let newIdDirectorateApprovedUserArr = [];
    let newIdStoreApprovedUserArr = [];
    let newIdIssueApprovedUserArr = [];
    let newIdReceivedUserArr = [];
    let newIdUserOwnedAssetArr = [];

    let userId = obj.userId;
    let assetIdArr = obj.assetId;

    let user = await userModel.findById(userId);
    console.log(user);
    console.log(assetIdArr);
    
    //DeAssigning code
                        
            console.log('DeAssign now by Admin');
            
            //next
            user.userAsset.id.forEach(item=>{
                if(assetIdArr.indexOf((item.toString())) == -1){
                    newIdArr.push(item);
                } //string to mongoose.Types.ObjectId.  How to
            })
            
            user.approvedUserAsset.id.forEach((item,i)=>{
                if(assetIdArr.indexOf((item.toString())) == -1){
                    console.log('Passed 1');
                    newIdApprovedUserArr.push(item);
                } else{ //handles assetTypes, etc.
                    console.log('Passed 1.5');
                    //splice the others
                    user.approvedUserAsset.idType.splice(i, 1);
                    user.approvedUserAsset.assignDate.splice(i, 1);
                }    //string to mongoose.Types.ObjectId.  How to
            })
            
            user.directorateApprovedUserAsset.id.forEach((item,i)=>{
                console.log('Passed 2');
                if(assetIdArr.indexOf((item.toString())) == -1){
                    newIdDirectorateApprovedUserArr.push(item);
                } else{
                    console.log('Passed 2.5');
                    //splice the others
                    user.directorateApprovedUserAsset.idType.splice(i, 1);
                    user.directorateApprovedUserAsset.assignDate.splice(i, 1);
                }    //string to mongoose.Types.ObjectId.  How to
            })
            
            user.storeApprovedUserAsset.id.forEach((item,i)=>{
                console.log('Passed 3');
                if(assetIdArr.indexOf((item.toString())) == -1){
                    newIdStoreApprovedUserArr.push(item);
                } else{
                    //splice the others
                    console.log('Passed 3.5');
                    user.storeApprovedUserAsset.idType.splice(i, 1);
                    user.storeApprovedUserAsset.assignDate.splice(i, 1);
                }    //string to mongoose.Types.ObjectId.  How to
            })
            
            user.issueApprovedUserAsset.id.forEach((item,i)=>{
                if(assetIdArr.indexOf((item.toString())) == -1){
                    console.log('Passed 4');
                    newIdIssueApprovedUserArr.push(item);
                } else{
                    console.log('Passed 4.5');
                    //splice the others
                    user.issueApprovedUserAsset.idType.splice(i, 1);
                    user.issueApprovedUserAsset.assignDate.splice(i, 1);
                }    //string to mongoose.Types.ObjectId.  How to
            })
            user.receivedUserAsset.id.forEach((item,i)=>{
                if(assetIdArr.indexOf((item.toString())) == -1){
                    newIdReceivedUserArr.push(item);
                } else{
                    //splice the others
                    user.receivedUserAsset.idType.splice(i, 1);
                    user.receivedUserAsset.assignDate.splice(i, 1);
                }    //string to mongoose.Types.ObjectId.  How to
            })

            user.userOwnedAsset.id.forEach((item,i)=>{
                if(assetIdArr.indexOf((item.toString())) == -1){
                    newIdUserOwnedAssetArr.push(item);
                } else{
                    //splice the others
                    user.userOwnedAsset.idType.splice(i, 1);
                    user.userOwnedAsset.assignDate.splice(i, 1);
                }    //string to mongoose.Types.ObjectId.  How to
            })
            console.log('Passed 5');
            
            //is this necessary?
            // let adminApprover = await userModel.find({}).where('userRole.role').equals('adminApproval');//.where('userRole.domain').equals(user.state);//.where('userRole.domain').equals(user.directorate)
            
            //keeping trail of approvals to the user doing admin deAssigning
            
            // stateApprover[0].userRole.usersToApprove.forEach(objItem=>{
                
                //Is this necessary?
                // for (const objItem of adminApprover[0].userRole.usersToApprove){
                    //     objItem.approvedAssets.forEach((asset,i)=>{
                        //     // for (asset of objItem.approvedAssets(asset,i)=>{
                            //         console.log('second foreach')
                            //         if(assetIdArr.indexOf((asset.toString())) > -1){
                                //             console.log(objItem.approvedAssets);
                                //             console.log('Splicing...');
                                //             objItem.approvedAssets.splice(i,1);
                                //             console.log(objItem.approvedAssets);
                                //         }
                                //     })
                                
                                // }
                                
                                // //remove if holding nothing
                                // for (var a=0;a < stateApprover[0].userRole.usersToApprove.length;a++){
                            //     if (stateApprover[0].userRole.usersToApprove[a].approvedAssets.length ==0){
                                //         stateApprover[0].userRole.usersToApprove.splice(a,1); 
                                //     }
                                // }
                                // let savedStateApprover = await stateApprover[0].save();
                                
                                //userAssetArr.idArr //items to deAssign
                                
                                
                                let assetsNamesToAssign = await assetModel.find().where('_id').in(newIdArr).select('assetType status allocationStatus assetApproval').exec();
                                let affectedAssets = await assetModel.find().where('_id').in(assetIdArr).select('assetType status allocationStatus assetActivityHistory assetApproval');
                                
                                console.log('This is affectedAssets (admin DeAssign)', affectedAssets);
            // affectedAssets.forEach(async asset=>{
                
                for (const asset of affectedAssets){
                    console.log('Did it get here?');
                    asset.assetAllocationStatus = false;
                    // asset.assetStatus = 'Free Asset'; //let assetStatus be a product of audit
                    // asset.assetApproval.ownApproval = null;
                    asset.assetApproval = {
                        ownApproval:'admin',
                        stateApproval:'admin',
                        directorateApproval:'admin',
                        storeApproval:'admin',
                        issuerApproval:'admin'
                    }
                    
                    //shouldn't there be more
                    let savedAsset = await asset.save();
                    console.log(savedAsset);
                }
                var assetTypeArr = [];
                assetsNamesToAssign.forEach(asset=>{
                    console.log('Is this right?');
                    // asset.assetAllocationStatus = false; //we have to bring false assets and store them under their asset Divs as used items
                    // asset.assetAllocationStatus = true; //we have to bring false assets and store them under their asset Divs as used items
                    // asset.assetStatus = 'Assigned';
                    assetTypeArr.push(asset.assetType); //or asset.assetName?
                })
                
                //reassign updated assetId types to user
                console.log('6--');
                console.log('This is userAssetArr.idArr right before log: ', assetIdArr);
                
                //reassign updated assetIds to user
                console.log('Passed id');
                user.userAsset.id = newIdArr;
                user.userAsset.idType = assetTypeArr; //very correct
                console.log('Passed idType');
                user.approvedUserAsset.id = newIdApprovedUserArr;
                user.directorateApprovedUserAsset.id = newIdDirectorateApprovedUserArr;
                user.storeApprovedUserAsset.id = newIdStoreApprovedUserArr;
                user.issueApprovedUserAsset.id = newIdIssueApprovedUserArr;
                user.receivedUserAsset.id = newIdReceivedUserArr;
                user.userOwnedAsset.id = newIdUserOwnedAssetArr;
                await user.save();
                console.log('Passed Saved');

                //is this ever used?
            redirectUser = user.id;
            
            for (var a=0; a<obj.assetId.length; a++){
                let approvedObj = {
                    activity:'DeAssign(Admin)',
                    userId:obj.userId[a],
                    assetId:obj.assetId[a],
                    approvalDate:new Date(Date.now()),
                    adminApprovalBy:req.user.userName   
                }
                console.log('This is req.user: ', req.user);
                req.user.adminApprovals.push(approvedObj);  
                await req.user.save();
            }
            

            //Logs
                let objActivity = {
                    activity:'DeAssign',
                    user:user.id,
                    activityBy:req.user.id,
                    activityDate:new Date (Date.now())
                };

                affectedAssets[0].assetActivityHistory.push(objActivity);
                await affectedAssets[0].save();
                userLogSave(user, affectedAssets, 'DeAssign', req);
                userLogSave2(user, affectedAssets, 'DeAssign', req); //modern log
            //End of Logs

            res.send('DeAssigned');
        
})

// async function userLogSave(user, list, assignment, req){
//     const userLog = new userLogModel({ //we're later getting asset from the form
//         user:user.id,
//         activity:assignment,
//         assignedBy:req.user.id
//     });

//     switch(assignment){
//         case 'Requisition':
//             console.log('Requisition!')
//             userLog.userAsset.id = list;
//             userLog.assetList = list;//userAsset
//             break;
//         case 'Assign':
//             console.log('Assign')
//             userLog.userAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'DeAssign':
//             console.log('DeAssign')
//             userLog.userAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Approve':
//             console.log('Approve')
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'DeApprove':
//             console.log('DeApprove')
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'D.Approve':
//             console.log('D.Approve');
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'D.DeApprove':
//             console.log('D.DeApprove');
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Store.Approve':
//             console.log('Store Approve');
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Store.DeApprove':
//             console.log('Store DeApprove');
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Issuer.Approve':
//             console.log('Issuer Approve');
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Issuer DeApprove':
//             console.log('Issuer.DeApprove');
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Issuer.DeApprove':
//             console.log('Issuer.DeApprove');
//             userLog.userAsset.id = list;
//             // userLog.userApprovedAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Directorate Approval':
//             // userLog.userAsset.id = list;
//             userLog.userAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Store Approval':
//             // userLog.userAsset.id = list;
//             userLog.userAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Issue Approval':
//             // userLog.userAsset.id = list;
//             userLog.userAsset.id = list;
//             userLog.assetList = list;
//             break;
//         case 'Received Asset':
//             // userLog.userAsset.id = list;
//             userLog.userAsset.id = list;
//             userLog.assetList = list;
//             break;
//         default:
//             console.log('Does not fit');
//     }
//     console.log('Saving now+++++++++++++++');
//     await userLog.save();
// }

route.get('/bringUser/:id', async (req, res)=>{
    console.log('Will bring names...', req.params.id);
    let queryObj = JSON.parse(req.params.id);
    console.log(queryObj);

    let query = userModel.find();
                if (queryObj.userName != null && req.query.userName != ""){
                    query = query.regex('firstName', new RegExp(queryObj.userName, 'i'));
                }
                // if (queryObj.userName != null && queryObj.userName != ""){
                //     query = query.lte('firstName', queryObj.userName);
                // }
                if (queryObj.userState != null && queryObj.userState != ""){
                     query = query.where('state').equals(queryObj.userState);
                    
                }
                if (queryObj.userDir != null && queryObj.userDir != ""){
                     query = query.where('directorate').equals(queryObj.userDir);
                    
                }
                if (queryObj.userRank != null && queryObj.userRank != ""){
                     query = query.where('rank').equals(queryObj.userRank);
                    
                }

                let users = await query.exec();

                let userObjs = users.map(user=>{
                    return {name:user.firstName, id:user.id, state:user.state, geoCoord:user.geoCoord}
                })

                console.log('The users: ', users); 
                res.send(userObjs)

});

route.put('/assignToUser/:userId/:assetId', async(req, res)=>{
    console.log('Assigning... to user ', req.params.userId);
    try{
        let user = await userModel.find({}).where('_id').equals(req.params.userId);
        let asset = await assetModel.find({}).where('_id').equals(req.params.assetId);
        // console.log(asset);
    
        asset[0].assetLocationHistory.push(user[0]._id);
        asset[0].assetUserHistory.push(user[0]._id);
        asset[0].assetAllocationStatus = true;
        // asset[0].assetStatus = 'Assigned';
        asset[0].assetCode = asset[0].assetCode == '0012'? uuidv4():asset[0].assetCode;
        
        asset[0].assetApproval ={
            ownApproval:'admin',//approved
            stateApproval:'admin',
            directorateApproval:'admin',
            storeApproval:'admin',
            issuerApproval:'admin'
        };

        //Keeping track of Assigned items to the Admin carrying out admin assign
       // for (var a=0; a<obj.assetId.length; a++){
            let approvedObj = {
                activity:'Assign(Admin)',
                userId:req.params.userId,
                assetId:req.params.assetId,
                approvalDate:new Date(Date.now()),
                adminApprovalBy:req.user.userName   
            }
            console.log('This is req.user: ', req.user);
            req.user.adminApprovals.push(approvedObj);  
            await req.user.save();
       // }

        let newAssetSaved = await asset[0].save();
                //reflect it in user profile

                                //for own approval
                                user[0].userAsset.id.push(newAssetSaved._id);
                                user[0].userAsset.idType.push( newAssetSaved.assetName);
                                user[0].userAsset.assignDate.push(Date.now());
                                
                                //for state approval
                                user[0].approvedUserAsset.id.push(newAssetSaved._id);
                                user[0].approvedUserAsset.idType.push( newAssetSaved.assetName);
                                user[0].approvedUserAsset.assignDate.push(Date.now());

                                //directorate approval
                                user[0].directorateApprovedUserAsset.id.push(newAssetSaved._id);
                                user[0].directorateApprovedUserAsset.idType.push( newAssetSaved.assetName);
                                user[0].directorateApprovedUserAsset.assignDate.push(Date.now());
                                
                                //Store approval
                                user[0].storeApprovedUserAsset.id.push(newAssetSaved._id);
                                user[0].storeApprovedUserAsset.idType.push( newAssetSaved.assetName);
                                user[0].storeApprovedUserAsset.assignDate.push(Date.now());
                                
                                //Issue Appproval
                                user[0].issueApprovedUserAsset.id.push(newAssetSaved._id);
                                user[0].issueApprovedUserAsset.idType.push( newAssetSaved.assetName);
                                user[0].issueApprovedUserAsset.assignDate.push(Date.now());

                                let userAssetOwned = JSON.parse(JSON.stringify(user[0].storeApprovedUserAsset));
                                //final owned assets
                                user[0].userOwnedAsset = userAssetOwned;

                                await user[0].save();
            
            
            //Logs
                let objActivity = {
                    activity:'Assign',
                    user:user[0].id,
                    activityBy:req.user.id,
                    activityDate:new Date (Date.now())
                }
                newAssetSaved.assetActivityHistory.push(objActivity);
                await newAssetSaved.save();
                userLogSave(user[0], asset, 'Assign', req);
                userLogSave2(user[0], asset, 'Assign', req);//modern log
            //End of Logs

        res.status(200).send({msg:'Asset Re-allocated'});
        // res.send('Assigned')

    }catch(e){
        console.error(e.message);
    }
})

route.get('/adminCreateAsset/:id/:numberOfAsset', async (req, res)=>{
    console.log('Working2..');
    try {
        let assetType = await assetTypeModel.find({}).where('_id').in(req.params.id);
        let newAssetSaved;
        for (assetTypeItem of assetType){
            let newAsset = new assetModel({
                // assetCode: uuidv4(),
                assetType: assetTypeItem._id,
                assetName: assetTypeItem.assetTypeClass,
                assetStatus:'Created Asset',
                assetImageName: assetTypeItem.assetTypeImageName,
                assetDescription:assetTypeItem.assetTypeDescription,
                assetAllocationStatus:false
            })
            // newAssetSaved = await newAsset.save();

            //Log
            let objActivity = {
                activity:'Asset Create',
                user:req.user.id,
                activityBy:req.user.id,
                activityDate:new Date (Date.now())
            }
            newAsset.assetActivityHistory.push(objActivity);
            await newAsset.save();
            userLogSave(req.user, [newAsset], 'Asset Create', req); //id 0000 means, no user yet
            userLogSave2(req.user, [newAsset], 'Asset Create', req); //modern log

        }
        res.json(await{newAssetSaved});

    }catch(e){
        console.log(e.message)
    }

})

route.get('/assetHistory/:assetId', async (req, res)=>{
    console.log(req.params.assetId);
    try{
        let asset = await assetModel.find({}).where('_id').equals(req.params.assetId);
        res.status(200).json({msg:asset})
    }catch(e){

    }
})

module.exports = route;
