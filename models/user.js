var mongoose = require('mongoose');
const assetTypeModel = require('./assetType.js')
mongoose.connect('mongodb://localhost/AssetManager');

const profileImagePath = 'uploads/profilePics';

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
        type:String,
        required:true
    },
    assetType:{
        type:mongoose.Schema.Types.ObjectId,
        reference:assetTypeModel
        //required:assetTypeModel
    
    }
});

let userModel = mongoose.model('UserCol', userSchema);

module.exports = userModel;
module.exports.profileImagePath = profileImagePath;