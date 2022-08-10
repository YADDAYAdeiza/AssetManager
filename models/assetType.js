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
    assetManufacturer:{
        type:String,
        required:true,
        default: 'Open Market'
    },
    assetPurchased:{
        type:Date,
        required:true,
        default:function(){
            return Date.now();
        }
    },
    assetStoreLocation:{
        type:String,
        required:true
    },
    assetValue:{
        type:Number
    },
    assetQty:{
        type:Number,
        required:true
    },
    assetLifeCycle:{
        type:Number
    },
    status:{
        type:String,
        required:true,
        default:'New'
    },
    assetTypeImageName:{
        type:String,
        required:true
    },
    assetTypeImageType:{
        type:String,
        required:true
    },
    assetDescription:{
        type:String,
        default:"The Asset Type description goes in here "
    }
});

assetTypeSchema.pre('remove', function(next){
    console.log('Gotten in preRemove..');
    //input any constraints here.

    next();
})

assetTypeSchema.virtual('assetTypeImageDetails').get(function(){
    if (this.assetTypeImageName != null && this.assetTypeImageType != null){
        // return `data:${this.assetTypeImageType};charset=utf-8;base64,${this.assetTypeImageName.toString('base64')}`
        return `https://ams-users.s3.us-west-1.amazonaws.com/assetType/${this.assetTypeImageName}`

    }
})



let assetTypeModel = mongoose.model('AssetTypeCol', assetTypeSchema);

module.exports = assetTypeModel;
