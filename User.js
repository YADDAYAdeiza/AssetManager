let mongooseVar = require('mongoose');
let userSchema = new mongooseVar.Schema({
    name: String,
    designation: String,
    email: String,
    createdAt: Date,
    updatedAt: Date,
    hobbies:[String],
    age:Number
});
 
let modelUser = mongooseVar.model("User", userSchema);

module.exports =  modelUser; 