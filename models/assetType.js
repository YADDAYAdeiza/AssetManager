var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/AssetManager');
mongoose.set('strictQuery', false);

if (process.env.NODE_ENV !=='production'){
    var dotEnv =  require('dotenv');
    dotEnv.config();
}
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true }); //play around with this



let assetTypeSchema = new mongoose.Schema({
    assetTypeCode:{
        type:String,
        required:true
    },
    assetTypeClass:{
        type:String,
        required:true,
    },
    assetTypeManufacturer:{
        type:String,
        required:true,
        default: 'Open Market'
    },
    assetTypeManufacturerAddress:{
        type:String,
        required:true,
        default: 'Wyoming'
    },
    assetTypeManufacturerPhone:{
        type:Number,
        default: '08035903643'
    },
    assetTypeManufacturerEmail:{
        type:String,
        required:true,
        default: '08035903643'
    },
    assetTypePurchased:{
        type:Date,
        required:true,
        default:function(){
            return Date.now();
        }
    },
    assetTypeStoreLocation:{
        type:String,
        required:true
    },
    assetTypeValue:{
        type:Number
    },
    assetTypeQty:{
        type:Number,
        required:true
    },
    assetTypeLifeCycle:{
        type:Number
    },
    assetTypeStatus:{
        type:String,
        required:true,
        default:'New'
    },
    assetTypeTrackable:{
        type:Boolean,
        default:false
    },
    assetTypeImageName:{
        type:String
        // required:true
    },
    assetTypeImageType:{
        type:String,
        required:true
    },
    assetTypeDescription:{
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
        // return `https://ams-users.s3.us-west-1.amazonaws.com/assetType/${this.assetImageName}`


    }
})



let assetTypeModel = mongoose.model('AssetTypeCol', assetTypeSchema);

module.exports = assetTypeModel;
