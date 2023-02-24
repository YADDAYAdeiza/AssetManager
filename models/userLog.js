var mongoose = require('mongoose');
const assetTypeModel = require('./assetType.js');
const assetModel = require('./asset.js');
const userModel = require('./user.js');
// mongoose.connect('mongodb://localhost/AssetManager');
// const path = require('path');

if (process.env.NODE_ENV !=='production'){
    var dotEnv =  require('dotenv');
    dotEnv.config();
}
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true }); //play around with this

// const profileImagePath = 'uploads/profilePics';

let userLogSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:userModel
    },
    activity:{
        type:String,
        required:true,
        default:'Assignment'
    },
    activityDate:{
        type:Date,
        required:true,
        default: ()=>{
            return Date.now()
        },
        immutable:true
    },
    userAsset:{
        id:{
            type:[mongoose.Schema.ObjectId],
            ref:assetModel,
            required:true
        }
    },
    userApprovedAsset:{
        id:{
            type:[mongoose.Schema.ObjectId],
            ref:assetModel,
            required:true
        }
    },
    userRequisition:{
        type:Object
    },
    userRequisitionDirectorateApproval:{
        type:Object
    },
    userRequisitionDirectorateApproval:{
        type:Object
    },
    assignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:userModel
    }
});


//
// ,
//     firstName:{
//         type:String,
//         required:true
//     },
//     lastName:{
//         type:String,
//         required:true
//     },
//     cadre:{
//         type:String,
//         required:true
//     },
//     rank:{
//         type:String,
//         uppercase:true,
//         required:true
//     },
//     state:{
//         type:String
//     },
    
//     assetType:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:assetTypeModel
//     },




// userLogSchema.virtual('userProfilePic').get(function(){
//      if (this.profilePic != null && this.profilePicType != null){
//          return `data:${this.profilePicType};charset=utf-8;base64,${this.profilePic.toString('base64')}`
//      }else{ //this gives it a default image
//         return '/nafdac_logo.png';
//      }
// });

// userLogSchema.methods.blow = function(){
//     return `My full name is ${this.firstName} ${this.lastName}`
// }

// userLogSchema.pre('remove', function(next){
//     console.log('Gotten in preRemove..');
//     assetModel.find({user: this.id}, (err, assets)=>{
//         if (err){
//             next(err)
//         } else if (assets.length > 0){ //if assets attached to user
//             next(new Error('This user has assets still'))
//         } else { //if no errors, and if no assets attached to user
//             next()
//         }
//     });
// })

//We may have to do for asset, assetType and contractor, but think about this
let userLogModel = mongoose.model('UserLog', userLogSchema);

module.exports = userLogModel;
// module.exports.profileImagePath = profileImagePath;
