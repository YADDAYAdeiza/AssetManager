let userModel = require('./models/user');


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

 function permitLists(){
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
            query = query.where('_id').in(req.user.profileId)
       
        // if (req.user.role =='basic' && req.user.profileId.length){
        //     console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
        // } else if (req.user.role =='admin'){
        //     // query = '';
        //     console.log('??')
        //     query = userModel.find();
        // } else if (req.user.role =='admin' && req.user.profileId.length){
        //     query = userModel.find();

        // }
        req.queryObj = query;
        next();
    }
}

module.exports = {
    adminAuth,
    authenticateRole,
    authenticateRoleProfilePage,
    permitLists,
    permitListsLogin
}
