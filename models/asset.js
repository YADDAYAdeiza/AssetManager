var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/AssetManager');
if (process.env.NODE_ENV !=='production'){
    var dotEnv =  require('dotenv');
    dotEnv.config();
}
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true }); //play around with this

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
    assetStatus:{
        type:String,
        required:true,
        default:'New'
    },
    assetUsedDuration:{
        type:String,
        default:'0 Day(s)'
    },
    assetDescription:{
        type:String,
        default:'Na so'
    },
    assetAssignDate: {
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
        required: true,
        default:'An image'
    },
    assetUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'UserCol'
    },
    assetUserHistory:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'UserCol'
    },
    assetLocationHistory:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'UserCol'
    },
    assetDescription:{
        type:String,
        default:"Description, like date of purchase, history, blah blah, goes in here"
    },
    assetAllocationStatus:{
        type:Boolean
    },
    assetTracked:{
        type:Boolean,
        defualt:false
    },
    assetTrackedPosition:{
        type:Object
    },
    assetApproval:{
        type:Object,
        default:{
            self:'approved',
            state:null,
            directorate:null,
            store:null,
            issue:null
        }
    },
    auditTrail:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'UserCol'
            },
            auditDate:{
                type:[Date],
                default:()=>{
                    return Date.now()
                }
            },
            auditedBy:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'UserCredCol'
            },
            auditStatus:{
                type:String
            }
        }
    ]
    //userTrail:[mongoose.Schema.Types.ObjectId]
});

assetSchema.virtual('assetImageDetails').get(function(){
    if (this.assetImageName != null && this.assetImageType != null){
        // return `data:${this.assetImageType};charset=utf-8;base64,${this.assetImageName.toString('base64')}`
        return `https://ams-users.s3.us-west-1.amazonaws.com/assetType/${this.assetImageName}`

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