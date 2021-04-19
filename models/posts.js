const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostsSchema = new Schema({ 
    likes:{ 
        type:Number,
        require:true, 
        default:0, 
    }, 
    description:{ 
        type:String, 
        default:'',
    }, 
    userId:{
        type:mongoose.Schema.ObjectId, 
        required:true, 
        max:1, 
        ref:'User',
    }, 
    
    postPath: {
        type:String, 
        require:true, 
    } 
},{timestamps:true});

const Posts = mongoose.model('Posts', PostsSchema);
module.exports = Posts ;  
