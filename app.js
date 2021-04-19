//IMPORTS
const express = require('express'); 
const mongoose = require('mongoose')
const Posts = require('./models/posts'); 
const bcrypt = require('bcrypt');
const User = require('./models/User'); 
const {json} = require('express');
const app = express(); 
const multer = require('multer');
const userRoutes = require('./routes/user'); 
const PostRoutes = require('./routes/post'); 
require('dotenv').config()

// App config
app.use(express.json()); 
app.use(express.urlencoded({extended:false})); 
app.use('/Posts', express.static('Posts')) ; 
app.use('/profiles', express.static('profiles')) ; 
apiURL = 'localhost:5000'

const PORT = 5000 ;

const DBURI = process.env.MONGO_SERVER ;

mongoose.connect(DBURI,{ useUnifiedTopology: true, useNewUrlParser: true})
    .then((result)=>{
        app.listen(PORT,()=>console.log(`app running @ port: ${PORT}`)); 
        console.log('connected to database');  
    })  
    .catch((error)=>{ 
        console.log(error); 
    })
 
var hashPassword = async (password,rounds=10) => {
  const hash = await bcrypt.hash(password, rounds)
    return hash ; 
}



//sample
app.get('/api',(req,res)=>{
    res.json({
        message :'This is rest api read docs @ https://github.com/dvsujan/expressl', 
    }); 
});

//routes

app.use('/api/user/',userRoutes); 

app.use('/api/posts/',PostRoutes);
module.exports = app; 