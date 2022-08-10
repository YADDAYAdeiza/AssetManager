var mongoose = require('mongoose');
const assetTypeModel = require('./assetType.js');
const assetModel = require('./asset.js');
mongoose.connect('mongodb://localhost/AssetManager');
// const path = require('path');

// const profileImagePath = 'uploads/profilePics';

let userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    cadre:{
        type:String,
        required:true
    },
    rank:{
        type:String,
        uppercase:true,
        required:true
    },
    email:{
        type:String,
        lowercase:true,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    state:{
        type:String
    },
    zone:{
        type:String
    },
    directorate:{
        type:String
    },
    geoCoord:{
        type:Object,
        required:true
    },
    profilePic:{
        type: String
    },
    profilePicType:{
        type:String
    },
    assetType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'assetTypeModel'
    },
    dateCreated:{
        type:Date,
        required:true,
        default: ()=>{
            return Date.now()
        },
        immutable:true
    },
    userAsset:{
        id:{
            type:[mongoose.Schema.Types.ObjectId],
            ref:'AssetCol',
            required:true
        },
        idType:{
            type:[String],
            required:true
        },
        assignDate:{
            type:[Date],
            default:()=>{
                return Date.now()
            }
        }
    },
    userRequisition:{
        type:Object
    },
    userRole:{
        type:String,
        default:'Basic'
    },
    approvalStatus:{
        type:String
    },
    approvalSupId:{
        type:String
    },
    userClassList:Object,
    userDirectorateApproval:{ //activated for directorate managers
        type:[Object]
    },
    userStoreApproval:{//activated for store managers.  Both approvals may be activated in a case where store manager is equal to directorate manager
        type:[Object]
    },
    userIssuerApproval:{
        type:[Object]
    }
    
});

// userSchema.virtual('userProfilePic').get(function(){
//      if (this.profilePic != null && this.profilePicType != null){
//          return `data:${this.profilePicType};charset=utf-8;base64,${this.profilePic.toString('base64')}`
//      }else{ //this gives it a default image
//         return '/nafdac_logo.png';
//      }
// });

userSchema.virtual('userProfilePic').get(function(){
    if (this.profilePic != null && this.profilePicType != null){
        return `https://ams-users.s3.us-west-1.amazonaws.com/users/${this.profilePic}`
    }else{ //this gives it a default image
       return '/nafdac_logo.png';
    }
});

// userSchema.methods.blow = function(){
//     return `My full name is ${this.firstName} ${this.lastName}`
// }

userSchema.pre('remove', function(next){
    console.log('Gotten in preRemove..');

    //taking care of assets
    if (this.userAsset.id.length){
        next(new Error('This user has assets still'))
    }else{
        next();
    }

    

    // assetModel.find({user: this.id}, (err, assets)=>{
    //     if (err){
    //         next(err)
    //     } else if (assets.length > 0){ //if assets attached to user
    //         next(new Error('This user has assets still'))
    //     } else { //if no errors, and if no assets attached to user
    //         next()
    //     }
    // });
});

//We may have to do for asset, assetType and contractor, but think about this
let userModel = mongoose.model('UserCol', userSchema);

module.exports = userModel;
// module.exports.profileImagePath = profileImagePath;
