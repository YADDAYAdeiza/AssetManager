var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');

let assetSchema = new mongoose.Schema({
    assetCode:{
        type:String,
        required:true,
        default:'0012'
    },
    assetType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'AssetTypeCol'
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
    assetImage:{
        type:String
    }, 
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'UserCol'

    }
});

let assetModel = mongoose.model('AssetCol', assetSchema);

module.exports = assetModel;