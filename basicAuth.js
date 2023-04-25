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
        console.log('req.params.id now: ', req.params.id);
        console.log('Authenticating profile page...');
        console.log('--');
        if (req.user.role == 'admin' || req.user.role == 'superAdmin'){
            // req.routeStr = 'user/showAdmin'
            if (req.user.profileId.includes(req.params.id)){
                //treat as own account
                //grant access to assign, DeAssign functionality
                console.log('It\'s own Account ', req.params.id);
                console.log(req.user.profileId);
                let uiOwnAccount = {
                    'ownAccount':'inline'
                }
                req.ownAccount = uiOwnAccount;
            }else {
                console.log('Not it\'s own Account')
                //treat as admin -no Assign DeAssign access
                let uiOwnAccount = {
                    'ownAccount':'none'
                }
                req.ownAccount = uiOwnAccount;
            }
            req.routeStr = 'user/show2'
        }else{
            console.log('Not admin or superAdmin')
            req.routeStr = 'user/show2'
        }
        console.log('This is req.ownAccount ', req.ownAccount);
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
                // query = userModel.find();
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
        console.log('Permitting lists for login now...')
        if (req.query.searchScope == undefined) {//search own profiles activated
            // searchScope
            if (req.user.role =='basic'){ //further dig
                let query;
                query = userModel.find();
                query = query.where('_id').in(req.user.profileId)
                req.queryObj = query;
            }
            if (req.user.role =='admin'){
                let query;
                query = userModel.find();
                console.log('Admin thing');
                // query = query.where('_id');
                // query = query.where('_id').ne('204');
                
                
                // query = query.where('_id').ne(null); //basically, all
                // query = userModel.find();
                //do nothing.
                // query = userModel.find();
                // query = query.where('_id').in(req.user.profileId)
                req.queryObj = query;
            }
            if (req.user.role =='superAdmin'){
                let query;
                query = userModel.find();
                console.log('superAdmin thing');
                // query = query.where('_id').in(req.user.profileId)

                
                // query = query.where('_id').ne(null); //basically, all
                // query = userModel.find();
                //do nothing.
                // query = userModel.find();
                req.queryObj = query;
            }
    }else {
        if (req.user.role =='basic'){ //further dig
            let query;
            query = userModel.find();
            query = query.where('_id').in(req.user.profileId)
            req.queryObj = query;
        }
        if (req.user.role =='admin'){
            let query;
            query = userModel.find();
            query = query.where('_id').in(req.user.profileId)
            console.log('Admin thing');
            // query = query.where('_id');
            // query = query.where('_id').ne('204');
            
            
            // query = query.where('_id').ne(null); //basically, all
            // query = userModel.find();
            //do nothing.
            // query = userModel.find();
            // query = query.where('_id').in(req.user.profileId)
            req.queryObj = query;
        }
        if (req.user.role =='superAdmin'){
            let query;
            query = userModel.find();
            query = query.where('_id').in(req.user.profileId)
            console.log('superAdmin thing');
            // query = query.where('_id').in(req.user.profileId)

            
            // query = query.where('_id').ne(null); //basically, all
            // query = userModel.find();
            //do nothing.
            // query = userModel.find();
            req.queryObj = query;
        }
    }
       
        // req.queryObj = query;
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
                //is this line necessary?
                // query = userModel.find();
            }else if(req.user.role =='superAdmin'){
                req.assetDeleteAccess = true;
            }
            // No need for superadmin
            // else if (req.user.role =='superAdmin'){
            //     //superadmin
            //blank
            // }
        }else{ //search all for admin
            if (req.user.role =='basic'){
                // query = query.where('_id').in(req.user.userAsset.id);
                query = query.where('_id').in(req.user.profileId);
                // query = query.where('_id').in(req.user.userAsset.id);
            } else if (req.user.role =='admin'){
                console.log('??')
                query = query.where('_id').in(req.user.profileId);
                // query = query.where('_id').in(req.user.userAsset.id);
            }else if (req.user.role =='superAdmin'){
                query = query.where('_id').in(req.user.profileId);
                req.assetDeleteAccess = true;
            }
            // else if (req.user.role =='superAdmin'){
            //     //superadmin
                // query = userModel.find();
            // }
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

        if (req.params.approval == 'issuerApproval'){
            console.log('For the issuer...');
            req.approvalSettings = {nonIssueApprovalClass:'none'};
            req.approvalId = req.params.approvalId;
        }

        if (req.params.approval == 'ownApproval'){
            console.log('For the issuer...');
            req.approvalSettings = {nonOwnApprovalClass:'none'};
            req.approvalId = req.params.approvalId;
        }

        if (req.params.approval == undefined){
            console.log('For the issuer...');
            req.approvalSettings = {nonOwnApprovalClass:'none'};
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
            if (req.user.subRole == 'staff'){
                let uiSettings = {
                    'onlyAdmin':'block',
                    'onlyStaff':'none',
                    'onlyAudit':'none'
                }
                req.dispSetting = uiSettings;
                
            }else {
                let uiSettings = {
                    'onlyAdmin':'block',
                    'onlyStaff':'none'
                }
                req.dispSetting = uiSettings;

            }
            console.log('--')
            console.log('This is it, ', req.dispSetting);

            // if (req.user.profileId.includes(req.params.id) ==  false){

            // }
        }
        if (req.user.role =='superAdmin'){
            console.log('Admin UI')
            let uiSettings = {
                'onlyAdmin':'block',
                'onlyStaff':'none',
                'onlyAudit':'none'
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
