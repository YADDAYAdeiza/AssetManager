var mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const assetTypeModel = require('./assetType.js');
const assetModel = require('./asset.js');

mongoose.set('strictQuery', false);

if (process.env.NODE_ENV !=='production'){
    var dotEnv =  require('dotenv');
    dotEnv.config();
  }
// mongoose.connect('mongodb+srv://user:JH9LtCTwlBU23p9A@cluster0.whvqq.mongodb.net/?retryWrites=true&w=majority');
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true }); //play around with this

// mongoose.connect('mongodb://localhost/AssetManager');
// const path = require('path');

// const profileImagePath = 'uploads/profilePics';

let userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    cadre:{
        type:String,
        required:true
    },
    rank:{
        type:String,
        uppercase:true,
        required:true
    },
    email:{
        type:String,
        lowercase:true,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    state:{
        type:String
    },
    zone:{
        type:String
    },
    directorate:{
        type:String
    },
    geoCoord:{
        type:Object,
        required:true
    },
    profilePic:{
        type: String
    },
    profilePicType:{
        type:String
    },
    assetType:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'AssetTypeCol'
    },
    dateCreated:{
        type:Date,
        required:true,
        default: ()=>{
            return Date.now()
        },
        immutable:true
    },
    userAsset:[
        {
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetCol',
                required:true
            },
            idType:{
                type:String,
                required:true
            },
            assignDate:{
                type:Date,
                default:()=>{
                    return Date.now()
                }
            },
            idAuditObj:{
                id:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'AssetCol',
                    required:true
                },
                auditDate:{
                    type:Date,
                    default:()=>{
                        return Date.now()
                    }
                },
                assetTypeId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'AssetTypeCol'
                },
                assetTypeName:{
                    type:String
                }
            }
        }
    ],
    approvedUserAsset:[
        {
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetCol',
                required:true
            },
            idType:{
                type:String,
                required:true
            },
            assignDate:{
                type:Date,
                default:()=>{
                    return Date.now()
                }
            },
        }
    ],
    directorateApprovedUserAsset:[
        {
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetCol',
                required:true
            },
            idType:{
                type:String,
                required:true
            },
            assignDate:{
                type:Date,
                default:()=>{
                    return Date.now()
                }
            },
        }
    ],
    storeApprovedUserAsset:[
        {
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetCol',
                required:true
            },
            idType:{
                type:String,
                required:true
            },
            assignDate:{
                type:Date,
                default:()=>{
                    return Date.now()
                }
            },
        }
    ],
    issueApprovedUserAsset:[
        {
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetCol',
                required:true
            },
            idType:{
                type:String,
                required:true
            },
            assignDate:{
                type:Date,
                default:()=>{
                    return Date.now()
                }
            },
        }
    ],
    receivedUserAsset:[
        {
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'AssetCol',
            required:true
        },
        idType:{
            type:String,
            required:true
        },
        assignDate:{
            type:Date,
            default:()=>{
                return Date.now()
            }
        },
        assignStatus:{
            type:String
        }
    }
    ],
    userOwnedAsset:[
        {
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetCol',
                required:true
            },
            idType:{
                type:String,
                required:true
            },
            assignDate:{
                type:Date,
                default:()=>{
                    return Date.now()
                }
            },
        idAuditObj:{
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetCol',
                required:true
            },
            auditDate:{
                type:Date,
                default:()=>{
                    return Date.now()
                }
            },
            assetTypeId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'AssetTypeCol'
            },
            assetTypeName:{
                type:String
            }
        }
    }
],
deallocatedAsset:[
    {
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'AssetCol',
            required:true
        },
        idType:{
            type:String,
            required:true
        },
        assignDate:{
            type:Date,
            default:()=>{
                return Date.now()
            }
        },
    idAuditObj:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'AssetCol',
            required:true
        },
        auditDate:{
            type:Date,
            default:()=>{
                return Date.now()
            }
        },
        assetTypeId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'AssetTypeCol'
        },
        assetTypeName:{
            type:String
        }
    }
}
],
    userRequisition:{
        type:Object
    },
    userRole:{
        role:{
            type:String,
            default:'ownApproval'
        },
        domain:{
            type:String
        },
       // usersToApprove:{
        //     // type:[String],
        //     type:[Object]
        // },
 
        usersToApprove: [{ 
            id:{type:String},
            approvedAssets:[
                {type: mongoose.Schema.Types.ObjectId, ref:'assetModel'}
            ]
        }],
        
        auditAssigns:[
            {
                genId:{
                    type:String
                },
                userState:{
                    type:String
                },
                userDirectorate:{
                    type:String
                },
                userRank:{
                    type:String
                },
                assetList:{
                    type:String
                },
                assetBefore:{
                    type:Date
                },
                assetManufacturer:{
                    type:String
                },
                assetLifeCycle:{
                    type:String
                },
                assignedUser:{
                    type:String
                },
                assignedBy:{
                    type:String
                },
                auditProgress:[{
                    assetId:{
                        type:String
                    },
                    status:{
                        type:String
                    },
                    auditDate:{
                        type:Date,
                        default:() => {
                            return Date.now()
                        }
                    }
                }],
                auditStatus:{
                    auditDate:{
                        type: Date
                    },
                    status:{
                        type:String,
                        default:'Pending'
                    }
                }
            }
        ],
        approvalSupId:{
            type:String
        },
    },
    userStateApproval:{ //activated for directorate managers
        type:[Object]
    },
    userDirectorateApproval:{ //activated for directorate managers
        type:[Object]
    },
    userStoreApproval:{//activated for store managers.  Both approvals may be activated in a case where store manager is equal to directorate manager
        type:[Object]
    },
    userIssuerApproval:{
        type:[Object]
    },
    userEmail:{
        type:String,
        lowercase:true,
        required:true
    },
    assetApproval:{
        type: Object,
        default:{
            self:'approved',
            state: null,
            directorate: null,
            store: null,
            issue: null
        }
    }
    
});

// userSchema.virtual('userProfilePic').get(function(){
//      if (this.profilePic != null && this.profilePicType != null){
//          return `data:${this.profilePicType};charset=utf-8;base64,${this.profilePic.toString('base64')}`
//      }else{ //this gives it a default image
//         return '/nafdac_logo.png';
//      }
// });

userSchema.virtual('userProfilePic').get(function(){
    if (this.profilePic != null && this.profilePicType != null){
        return `https://ams-users.s3.us-west-1.amazonaws.com/users/${this.profilePic}`
    }else{ //this gives it a default image
       return '/nafdac_logo.png';
    }
});

// userSchema.methods.blow = function(){
//     return `My full name is ${this.firstName} ${this.lastName}`
// }

userSchema.pre('remove', function(next){
    console.log('Gotten in preRemove..');
    console.log('This is approving role: ', this.userRole.role);
    //taking care of assets
    // if (err){
    //     console.log('This is err: ', err);
    //     next(err)
    if (this.userAsset.id.length ||this.userRole.role != 'ownApproval'){// if staff has no assets, or staff is not in an approving role beyond 'ownApproval'
        console.log('This is length: ', this.userAsset.id.length);
        next(new Error('This user has assets still'))
    }else{
        next();
    }

    

    // assetModel.find({user: this.id}, (err, assets)=>{
    //     if (err){
    //         next(err)
    //     } else if (assets.length > 0){ //if assets attached to user
    //         next(new Error('This user has assets still'))
    //     } else { //if no errors, and if no assets attached to user
    //         next()
    //     }
    // });
});

//We may have to do for asset, assetType and contractor, but think about this
let userModel = mongoose.model('UserCol', userSchema);

module.exports = userModel;
// module.exports.profileImagePath = profileImagePath;
