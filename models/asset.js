var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');

const uploadAssetPath = 'uploads/assetPics';

let assetSchema = new mongoose.Schema({
    assetCode:{
        type:String,
        required:true,
        default:'0012'
    },
    assetType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'AssetTypeCol',
        required:true
    },
    Status:{
        type:String,
        required:true,
        default:'New'
    },
    description:{
        type:String,
        default:'Na so'
    },
    assignDate: {
        type:Date,
        required:true,
        default:Date.now()
    },
    assetImageName:{
        type:String,
        required: true
    }, 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'UserCol'
    }
});

let assetModel = mongoose.model('AssetCol', assetSchema);

module.exports = assetModel;
module.exports.uploadAssetPath= uploadAssetPath;