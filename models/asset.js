var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');
const assetTypeModel = require('./assetType.js');


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
    assetName:{
        type:String,
        default:'Chair'
    },
    status:{
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
    },
    assetDescription:{
        type:String,
        default:"Description, like date of purchase, history, blah blah, goes in here"
    },
    allocationStatus:{
        type:Boolean
    }
});

assetSchema.virtual('assetImageDetails').get(function(){
    if (this.assetImageName != null && this.assetImageType != null){
        return `data:${this.assetImageType};charset=utf-8;base64,${this.assetImageName.toString('base64')}`
    }
})

assetSchema.pre('remove', function(next){
    console.log('Gotten in preRemove..');
    //input any constraints here.


    // assetTypeModel.find({user: this.id}, (err, assets)=>{
    //     if (err){
    //         next(err)
    //     } else if (assets.length > 0){ //if assets attached to user
    //         next(new Error('This user has assets still'))
    //     } else { //if no errors, and if no assets attached to user
    //         next()
    //     }
    // });

    next();
})

let assetModel = mongoose.model('AssetCol', assetSchema);

module.exports = assetModel;