var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');

const profileImagePath = 'uploads/profilePics';
const contractorDocument = 'uploads/contractDocuments';

let contractorSchema = new mongoose.Schema({
    contractorCompanyName:{
        type:String,
        required:true
    },
    contractorAddress:{
        type:String,
        required:true,
    },
    contractorClass:{
        type:String,
        required:true,
        default: 'General Contractor'
    },
    Status:{
        type:String,
        required:true,
        default:'New'
    },
    description:{
        type:String,
        required:true,
        default:'General Supplier'
    },
    assignDate: {
        type:Date,
        required:true,
        default:Date.now()
    },
    contractDocs:{
        type:String
    }
});

let contractorModel = mongoose.model('ContractorCol', contractorSchema);

module.exports = contractorModel;
module.exports.contractorDocument = contractorDocument;