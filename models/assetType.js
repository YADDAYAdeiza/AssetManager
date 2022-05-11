var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');



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
    assetTypeImageName:{
        type:Buffer,
        required:true
    },
    assetTypeImageType:{
        type:String,
        required:true
    }
});

assetTypeSchema.virtual('assetTypeImageDetails').get(function(){
    if (this.assetTypeImageName != null && this.assetTypeImageType != null){
        return `data:${this.assetTypeImageType};charset=utf-8;base64,${this.assetTypeImageName.toString('base64')}`
    }
})

let assetTypeModel = mongoose.model('AssetTypeCol', assetTypeSchema);

module.exports = assetTypeModel;
