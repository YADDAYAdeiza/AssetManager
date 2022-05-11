var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/AssetManager');

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
    contractImageName:{
        type:Buffer,
        required:true
    },
    contractImageType:{
        type:String,
        required:true
    }
});


contractorSchema.virtual('contractorImageDetails').get(function(){
    if (this.contractImageName != null && this.contractImageType != null){
        return `data:${this.contractImageType};charset=utf-8;base64,${this.contractImageName.toString('base64')}`
    }
})

let contractorModel = mongoose.model('ContractorCol', contractorSchema);

module.exports = contractorModel;