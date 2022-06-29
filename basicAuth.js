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


module.exports = {
    adminAuth
}