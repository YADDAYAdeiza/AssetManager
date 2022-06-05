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
    designation:{
        type:String,
        //required:true
    },
    email:{
        type:String,
        //required:true
    },
    phone:{
        type:Number,
        required:true
    },
    username:{
        type:String,
        //required:true
    },
    password:{
        type:String,
        //required:true
    },
    profilePic:{
        type: Buffer,
        required:true
    },
    profilePicType:{
        type:String,
        required:true
    },
    assetType:{
        type:mongoose.Schema.Types.ObjectId,
        reference:assetTypeModel
    },
    asset:{
        type:mongoose.Schema.Types.ObjectId,
        reference:assetModel,
    },
    dateCreated:{
        type:Date,
        required:true,
        default:Date.now
    }
});

userSchema.virtual('userProfilePic').get(function(){
     if (this.profilePic != null && this.profilePicType != null){
         return `data:${this.profilePicType};charset=utf-8;base64,${this.profilePic.toString('base64')}`
     }
});

userSchema.pre('remove', function(next){
    console.log('Gotten in preRemove..');
    assetModel.find({user: this.id}, (err, assets)=>{
        if (err){
            next(err)
        } else if (assets.length > 0){ //if assets attached to user
            next(new Error('This user has assets still'))
        } else { //if no errors, and if no assets attached to user
            next()
        }
    });
})

//We may have to do for asset, assetType and contractor, but think about this
let userModel = mongoose.model('UserCol', userSchema);

module.exports = userModel;
// module.exports.profileImagePath = profileImagePath;
