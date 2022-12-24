var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');
const assetTypeModel = require('./assetType.js');



let assetTypeAuditSchema = new mongoose.Schema({
    assetType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:assetTypeModel
    },
    assetTypeAuditInterval:{
        type:Number,
        required:true,
        default:100
    }
});

assetTypeAuditSchema.pre('remove', function(next){
    console.log('Gotten in preRemove..');
    //input any constraints here.

    next();
})

assetTypeAuditSchema.virtual('assetTypeAuditImageDetails').get(function(){ //work onthis for pictures
    if (this.assetTypeImageName != null && this.assetTypeImageType != null){
        // return `data:${this.assetTypeImageType};charset=utf-8;base64,${this.assetTypeImageName.toString('base64')}`
        return `https://ams-users.s3.us-west-1.amazonaws.com/assetType/${this.assetTypeImageName}`

    }
})



let assetTypeAuditModel = mongoose.model('AssetTypeAuditCol', assetTypeAuditSchema);

module.exports = assetTypeAuditModel;