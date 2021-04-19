const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const strreq = { 
    type:String, 
    require:true, 
}

const strtep = { 
    type:String, 
    require:true, 
    unique:true,
}


const UserSchema = new Schema({ 
    username:strtep, 
    email:strtep, 
    password:{ 
        type:String, 
        required:true, 
        unique:false,
    }, 
    first_name:strreq, 
    last_name:strreq,
    DP:{ 
        type:String,
        default:"localhost:5000\profiles\default360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg"
    }, 
    followers:{ 
        type:Array,
    },
    following:{ 
        type:Array, 
    } 

},{timestamps:true});

const Users = mongoose.model('Users', UserSchema);
module.exports = Users ;  
