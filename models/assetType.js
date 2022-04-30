var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');

let assetTypeSchema = new mongoose.Schema({
    assetTypeCode:{
        type:String,
        required:true
    },
    assetClass:{
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
    }
});

let assetTypeModel = mongoose.model('AssetTypeCol', assetTypeSchema);

module.exports = assetTypeModel;