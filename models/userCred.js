var mongoose = require('mongoose');
const assetTypeModel = require('./assetType.js');
const assetModel = require('./asset.js');
mongoose.connect('mongodb://localhost/AssetManager');


let userCredSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        lowercase:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:'basic'
    },
    profileId:{
        type:String
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
let userCredModel = mongoose.model('UserCredCol', userCredSchema);

module.exports = userCredModel;
// module.exports.profileImagePath = profileImagePath;
