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
    es_indexed: true
}


const UserSchema = new Schema({ 
    username:strtep, 
    
    email:{ 
    type:String, 
    require:true, 
    unique:true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ 
    }, 
    
    password:{ 
        type:String, 
        required:true, 
    }, 
    name:strreq, 
    DP:{ 
        type:String,
        default:"profiles/default360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg"
    }, 
    followers:{ 
        type:Array,
    },
    following:{ 
        type:Array, 
    } 
    , 
    bio:{ 
        type:String , 
        default:'',
    },
    Active:{ 
        type:Boolean, 
        default:'false',
    }
},{timestamps:true});

const Users = mongoose.model('Users', UserSchema);
module.exports = Users ;  
