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
        type:Buffer,
        required: true
    }, 
    assetImageType:{
        type:String,
        required: true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'UserCol'
    }
});

assetSchema.virtual('assetImageDetails').get(function(){
    if (this.assetImageName != null && this.assetImageType != null){
        return `data:${this.assetImageType};charset=utf-8;base64,${this.assetImageName.toString('base64')}`
    }
})

let assetModel = mongoose.model('AssetCol', assetSchema);

module.exports = assetModel;