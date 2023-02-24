var mongoose = require('mongoose');
const assetTypeModel = require('./assetType.js');
const assetModel = require('./asset.js');
mongoose.connect('mongodb://localhost/AssetManager');

// if (process.env.NODE_ENV !=='production'){
//     var dotEnv =  require('dotenv');
//     dotEnv.config();
// }
// mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true }); //play around with this


let savedSnapShotsSchema = new mongoose.Schema({
    snapShotfileName:{
        type:String,
        default:'Langu',
        required:true
    },
    savedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'UserCredCol',
        required:true
    },
    saveDate:{
        type:Date,
        default:()=>{
            return Date.now()
        }
    },
    savedObj:{
        type:Object,
        required:true
    }
});

// userSchema.virtual('userProfilePic').get(function(){
//      if (this.profilePic != null && this.profilePicType != null){
//          return `data:${this.profilePicType};charset=utf-8;base64,${this.profilePic.toString('base64')}`
//      }else{ //this gives it a default image
//         return '/nafdac_logo.png';
//      }
// });

// userSchema.methods.blow = function(){
//     return `My full name is ${this.firstName} ${this.lastName}`
// }

// userSchema.pre('remove', function(next){
//     console.log('Gotten in preRemove..');
//     assetModel.find({user: this.id}, (err, assets)=>{
//         if (err){
//             next(err)
//         } else if (assets.length > 0){ //if assets attached to user
//             next(new Error('This user has assets still'))
//         } else { //if no errors, and if no assets attached to user
//             next()
//         }
//     });
// })

//We may have to do for asset, assetType and contractor, but think about this
let savedSnapShotsModel = mongoose.model('savedSnapShotsCol', savedSnapShotsSchema);

module.exports = savedSnapShotsModel;
// module.exports.profileImagePath = profileImagePath;
