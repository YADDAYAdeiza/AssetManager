const {instrument} = require('@socket.io/admin-ui');

let express = require('express');
let route = express.Router();

let ejs = require('ejs');
// let layout = require('express-ejs-layouts');

let assetModel = require('../models/asset.js');
let assetTypeModel = require('../models/assetType.js');
// const { rawListeners } = require('../models/asset.js');
const userModel = require('../models/user.js');
const userLogModel = require('../models/userLog.js');
let {v4:uuidv4} = require('uuid');
//route.set('layout', 'layouts/layout');

const io = require('socket.io')(2001, {
    cors:
    {
        origin:['http://localhost:2000']
    }
});
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
    let assetlog = await userLogModel.find({}).where('userAsset.id').equals(req.params.assetId); //the result will be Assign/DeAssign, as an asset is tracked across many users, and it could not have gone across many users without being severally Assingned and DeAssigned
    console.log('This is it ', assetlog);
    res.send(assetlog);
})


//get all assets
route.get('/index', permitAssetLists(), hideNavMenu(), async (req, res)=>{ //permitLists()
    console.log('filtering...');
    let query = req.queryObj
    //query.where('_id').in(req.user.profileId)
    
    let userModelVar = await query.select('firstName userAsset').exec();
    console.log('This is userModelVar: ', userModelVar);
    let assetIds = [];
    userModelVar.forEach(user=>{
        user.userAsset.id.forEach(assetId=>{
            assetIds.push(assetId.toString())
        })
    })

    console.log('(((((((((((((Query');
    console.log(req.query);
    console.log(assetIds)
    let assetQuery =  assetModel.find().where('_id').in(assetIds);
    
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
    res.render('./asset/index.ejs', {asset: assetModelVar, searchParams: req.query, uiSettings});
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
        const asset = await assetModel.findById(req.params.id).populate('assetType assetUserHistory assetLocationHistory').exec();
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


module.exports = route;
