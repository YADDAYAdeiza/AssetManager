let userModel = require('./models/user');
let assetModel = require('./models/asset');


const { NativeBuffer } = require("mongoose");

  function adminAuth(req, res, next){
    console.log( req.user);
    console.log( req.user.role);
    if (req.user){
        if (req.user.role =='admin'){
            req.authSetting = []
            req.user.authSetting = []
        }else if ( req.user.role == 'basic'){
            req.authSetting = ['hideAssign','hideContractors'];
        }
    }
    return next();
}



function authenticateRole(){ //should allow user view only the profiles they created
    return (req, res, next) =>{
        console.log('--');
        if (req.user.role == 'basic'){
            res.send('You are not authorized to view');

            //let req.user.profileId be displayed here
        }
        next();
    }
}

function authenticateRoleProfilePage(){
    return (req, res, next) =>{
        console.log('Authenticating profile page...');
        console.log('--');
        if (req.user.role == 'admin'){
            req.routeStr = 'user/showAdmin'
        }else{
            req.routeStr = 'user/show2'
        }
        next();
    }
}

 function permitLists(){ // used with searchScope
    return async (req, res, next)=>{
        console.log('Permitting lists...')
        console.log('req.query.searchScope is ', req.query.searchScope);
        let query = userModel.find();
        if (req.query.searchScope == undefined){ //search own profiles activated
            if (req.user.role =='basic'){
                query = query.where('_id').in(req.user.profileId)
            } else if (req.user.role =='admin'){
                console.log('??')
                query = userModel.find();
            }
        }else{ //search all for admin
            if (req.user.role =='basic'){
                query = query.where('_id').in(req.user.profileId)
            } else if (req.user.role =='admin'){
                console.log('??')
                query = query.where('_id').in(req.user.profileId)
            }
        }
        req.queryObj = query;
        next();
    }
}

function permitListsLogin(){
    return async (req, res, next)=>{
        console.log('Permitting lists for login...')
        let query = userModel.find();
        if (req.user.role =='basic'){ //further dig
            query = query.where('_id').in(req.user.profileId)
        }
        if (req.user.role =='admin'){
            //do nothing.
        }
       
        req.queryObj = query;
        next();
    }
}

function permitAssetLists(){
    return async (req, res, next)=>{
        console.log('Permitting asset lists...')
        // console.log('req.query.searchScope is ', req.query.searchScope);
        let query = userModel.find();
        if (req.query.searchAssetScope == undefined){ //search own profiles activated
            if (req.user.role =='basic'){
                query = query.where('_id').in(req.user.profileId);
                
                //extracting assets
                
                //assetUserHistory
                // query = query.where('assetUserHistory').in(req.user.profileId);
            } else if (req.user.role =='admin'){
                console.log('??')
                query = userModel.find();
            }
        }else{ //search all for admin
            if (req.user.role =='basic'){
                // query = query.where('_id').in(req.user.userAsset.id);
                query = query.where('_id').in(req.user.profileId);
                // query = query.where('_id').in(req.user.userAsset.id);
            } else if (req.user.role =='admin'){
                console.log('??')
                query = query.where('_id').in(req.user.profileId);
                // query = query.where('_id').in(req.user.userAsset.id);
            }
        }
        req.queryObj = query;
        next();
    }
}




function permitApproval(){
    return async (req, res, next)=>{
        console.log('Approval Status...', req.params.approval);
        
        if (req.params.approval == 'stateApproval'){
            console.log('For the state...');
            req.approvalSettings = {nonStateApprovalClass:'none'};
            req.approvalId = req.params.approvalId;
        }
        
        if (req.params.approval == 'directorateApproval'){
            console.log('For the directorate...');
            req.approvalSettings = {nonDirectorateApprovalClass:'none'};
            req.approvalId = req.params.approvalId;
        }
        
        if (req.params.approval == 'storeApproval'){
            console.log('For the store...');
            req.approvalSettings = {nonStoreApprovalClass:'none'};
            req.approvalId = req.params.approvalId;
        }
        
        
        
        // console.log('req.query.searchScope is ', req.query.searchScope);
        // let query = userModel.find();
        // if (req.query.searchAssetScope == undefined){ //search own profiles activated
        //     if (req.user.role =='basic'){
        //         query = query.where('_id').in(req.user.profileId);
                
        //         //extracting assets
                
        //         //assetUserHistory
        //         // query = query.where('assetUserHistory').in(req.user.profileId);
        //     } else if (req.user.role =='admin'){
        //         console.log('??')
        //         query = userModel.find();
        //     }
        // }else{ //search all for admin
        //     if (req.user.role =='basic'){
        //         // query = query.where('_id').in(req.user.userAsset.id);
        //         query = query.where('_id').in(req.user.profileId);
        //         // query = query.where('_id').in(req.user.userAsset.id);
        //     } else if (req.user.role =='admin'){
        //         console.log('??')
        //         query = query.where('_id').in(req.user.profileId);
        //         // query = query.where('_id').in(req.user.userAsset.id);
        //     }
        // }
        // req.queryObj = query;
        next();
    }
}



function hideNavMenu(){
    return async (req, res, next)=>{
        if (req.user.role =='basic'){
            console.log('Basic UI')
            let uiSettings = {
                'onlyAdmin':'none'
            }
            req.dispSetting = uiSettings;
            console.log('This is it, ', req.dispSetting);
        }

        if (req.user.role =='admin'){
            console.log('Admin UI')
            let uiSettings = {
                'onlyAdmin':'block',
                'onlyStaff':'none'
            }
            req.dispSetting = uiSettings;
            console.log('--')
            console.log('This is it, ', req.dispSetting);

            // if (req.user.profileId.includes(req.params.id) ==  false){

            // }
        }

        next();

    }

}

// let settingsObj = <%- JSON.stringify(uiSettings)%>;
//     console.log(settingsObj);
//     var settingsObjKeys = (Object.keys(settingsObj));
//     var settingsObjValues = (Object.values(settingsObj));
//     settingsObjKeys.forEach(className=>{
//         [ ...document.getElementsByClassName(className)].forEach(elm=>{
//             elm.style.display = settingsObj[className];
//         })
//     })
//     console.log(Object.values(settingsObj.sideNav));
module.exports = {
    adminAuth,
    authenticateRole,
    authenticateRoleProfilePage,
    permitLists,
    permitListsLogin,
    permitAssetLists,
    hideNavMenu,
    permitApproval
}
