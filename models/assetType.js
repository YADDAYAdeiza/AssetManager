var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');

const assetTypeImagePath = 'uploads/assetTypePics';


let assetTypeSchema = new mongoose.Schema({
    assetTypeCode:{
        type:String,
        required:true
    },
    assetTypeClass:{
        type:String,
        required:true,
    },
    Status:{
        type:String,
        required:true,
        default:'New'
    },
    description:{
        type:String,
        required:true,
        default:'Office use'
    },
    assignDate: {
        type:Date,
        required:true,
        default:Date.now()
    },
    assetTypePic:{
        type:String,
        required:true
    }
});

let assetTypeModel = mongoose.model('AssetTypeCol', assetTypeSchema);

module.exports = assetTypeModel;
module.exports.assetTypeImagePath = assetTypeImagePath;
