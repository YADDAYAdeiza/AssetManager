let userLogModel = require('./models/userLog');
let userLogModel2 = require('./models/userLog2');


async function userLogSave(user, list, assignment, req){
    const userLog = new userLogModel({ //we're later getting asset from the form
        user:user.id,
        activity:assignment,
        activityBy:req.user.id
    });

    switch(assignment){
        case 'Requisition':
            console.log('Requisition!')
            userLog.userAsset.id = list;
            userLog.assetList = list;//userAsset
            break;
        case 'Assign':
            console.log('Assign')
            userLog.userAsset.id = list;
            userLog.assetList = list;
            break;
        case 'DeAssign':
            console.log('DeAssign')
            userLog.userAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Approve':
            console.log('Approve')
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'DeApprove':
            console.log('DeApprove')
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'D.Approve':
            console.log('D.Approve');
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'D.DeApprove':
            console.log('D.DeApprove');
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Store.Approve':
            console.log('Store Approve');
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Store.DeApprove':
            console.log('Store DeApprove');
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Issuer.Approve':
            console.log('Issuer Approve');
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Issuer DeApprove':
            console.log('Issuer.DeApprove');
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Issuer.DeApprove':
            console.log('Issuer.DeApprove');
            userLog.userAsset.id = list;
            // userLog.userApprovedAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Directorate Approval':
            // userLog.userAsset.id = list;
            userLog.userAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Store Approval':
            // userLog.userAsset.id = list;
            userLog.userAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Issue Approval':
            // userLog.userAsset.id = list;
            userLog.userAsset.id = list;
            userLog.assetList = list;
            break;
        case 'Received Asset':
            // userLog.userAsset.id = list;
            userLog.userAsset.id = list;
            userLog.assetList = list;
            break;
        default:
            console.log('Does not fit');
    }
    console.log('Saving now+++++++++++++++');
    await userLog.save();
}


async function userLogSave2(user, list, assignment, req){
    try{
        let userConcerned = await userLogModel2.find({}).where('userId').equals(user.id);
        let objActivity = {
            activity:assignment,
            assetList:list,
            activityBy:req.user.id,
            activityDate:new Date (Date.now())
        }
        if (userConcerned.length){ //if user found, update user activity
            // userConcerned[0].userId = user.id;
            userConcerned[0].activity.push(objActivity);
            await userConcerned[0].save();
        }else{//user not found, create new user
            let userConcerned = new userLogModel2({
                userId:user.id
            });
            userConcerned.activity.push(objActivity);
            await userConcerned.save();
        }

    }catch(e){
        console.log(e);
    }

    // const userLog = new userLogModel2({ //we're later getting asset from the form
    //     user:user.id,
    //     activity:assignment,
    //     activityBy:req.user.id
    // });

    // switch(assignment){
    //     case 'Requisition':
    //         console.log('Requisition!')
    //         userLog.userAsset.id = list;
    //         userLog.assetList = list;//userAsset
    //         break;
    //     case 'Assign':
    //         console.log('Assign')
    //         userLog.userAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'DeAssign':
    //         console.log('DeAssign')
    //         userLog.userAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Approve':
    //         console.log('Approve')
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'DeApprove':
    //         console.log('DeApprove')
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'D.Approve':
    //         console.log('D.Approve');
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'D.DeApprove':
    //         console.log('D.DeApprove');
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Store.Approve':
    //         console.log('Store Approve');
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Store.DeApprove':
    //         console.log('Store DeApprove');
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Issuer.Approve':
    //         console.log('Issuer Approve');
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Issuer DeApprove':
    //         console.log('Issuer.DeApprove');
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Issuer.DeApprove':
    //         console.log('Issuer.DeApprove');
    //         userLog.userAsset.id = list;
    //         // userLog.userApprovedAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Directorate Approval':
    //         // userLog.userAsset.id = list;
    //         userLog.userAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Store Approval':
    //         // userLog.userAsset.id = list;
    //         userLog.userAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Issue Approval':
    //         // userLog.userAsset.id = list;
    //         userLog.userAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     case 'Received Asset':
    //         // userLog.userAsset.id = list;
    //         userLog.userAsset.id = list;
    //         userLog.assetList = list;
    //         break;
    //     default:
    //         console.log('Does not fit');
    // }
    // console.log('Saving now+++++++++++++++');
    // await userLog.save();
}



module.exports = {
    userLogSave,
    userLogSave2
}
