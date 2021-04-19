const express = require('express'); 
const mongoose = require('mongoose')
const Posts = require('./models/posts'); 
const bcrypt = require('bcrypt');
const User = require('./models/User'); 
const {json} = require('express');
const app = express(); 
const multer = require('multer');

app.use(express.json()); 
app.use(express.urlencoded({extended:false})); 
app.use('/Posts', express.static('Posts')) ; 
app.use('/profiles', express.static('profiles')) ; 
apiURL = 'localhost:5000'

function makeid(length) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * 
 charactersLength)));
   }
   return result.join('');
}


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './Posts/');
  },
  filename: function(req, file, cb) {
    cb(null,makeid(10)+file.originalname);
  }
});

const dpstorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './profiles/');
  },
  filename: function(req, file, cb) {
    cb(null,makeid(10)+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

const Dpupload = multer({ 
    storage:dpstorage,
    limit:{ 
        filesize:1024*1024*1,
    },
    fileFilter:fileFilter,
})
const PORT = 5000 ;

const DBURI = 'mongodb+srv://dvsujan:Ss100800@cluster0.ltuap.mongodb.net/app?retryWrites=true&w=majority' 

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

app.get('/api',(req,res)=>{
    res.json({
        message :'This is api for my app', 
    }); 
});
// USER INFO

app.get('/api/user/:id',(req,res)=>{ 
    const id = req.params.id;
    User.findById(id)
    .then((user)=>{
        resobj = { 
            username:user.username, 
            first_name:user.firest_name , 
            last_name:user.last_name , 
            followers:user.followers, 
            following:user.following, 
        } 
        res.status(200).json(resobj);  
    })
    .catch((err)=>{
        res.status(400).json({ 
            message:'user not found',
        })
    })
});

app.post('/api/user',Dpupload.single('ProfileImg'),(req, res)=>{ 
    var username =  req.body.username ; 
    var password = req.body.password; 
    var email = req.body.email; 
    var first_nam = req.body.first_name; 
    var last_name = req.body.last_name ; 
    try{
        const user =  new User({
            username:username, 
            email:email, 
            password:password, 
            first_name:first_nam, 
            last_name:last_name,
            DP:apiURL+'/'+req.file.path ,
        }).save()
        .then((user)=>{
            res.status(200).json({ 
            message:'new user registered',
            })
        })
        .catch((err)=>{ 
            res.status(400).json({
                error_code:err.code,
            })
        })
        
    }
    catch(err){
        console.log(errr);  
        res.status(400)
    }
}); 

app.patch('/api/user/',(req, res)=>{ 
    const first_nam = req.body.first_name ; 
    const last_name = req.body.last_name ; 
    const password = req.body.password ; 
    const id = req.body.id; 
    try{ 
        const rus = User.findByIdAndUpdate(id,{ 
            first_name:first_nam, 
            last_name:last_name, 
            password:password, 
        }).then((rus)=>{ 
            res.status(200).json({ 
                message:'success', 
            })
        })
   }
    catch(err){ 
        res.status(500).json({ 
            message:'error',
        })
    } 

});

app.get('/api/user/get-followers/:userid',(req,res)=>{ 
    id = req.params.userid; 
    User.findById(id)
    .then(function(user) {
        return res.json(user.following);
    })
    .catch(function(err) {
        return res.json(err);
    });     
});  

app.get('/api/user/getid/:username',(req,res)=>{ 
    const username = req.params.username;  
    const id = User.findOne({
        username:username
    }).then((id)=>{
        res.status(200).json({ 
            id:id._id,
        })
    }) 
    .catch((err)=>{
       res.status(200).json({
            error:err.code,
        })
    }) 
 
})

app.post('/api/user/follow',(req,res)=>{
    const id1 = req.body.id1;
    const id2 = req.body.id2; 
    try{
        const done = true ;   
        const result = User.findByIdAndUpdate(id1, 
            {
                $addToSet:{followers:id2},
            },
        ).then(()=>{
            done = true;
        }); 
        const resultt = User.findByIdAndUpdate(id2, 
            {
                $addToSet:{following:id1},
            },
        ).then(()=>{ 
            done = true ; 
        });
        if(done == true){ 
            res.json({
                message:'done', 
            })
        }
    } 
    catch(err){ 
        res.status(400).json({
            message:'error',
        }); 
    }
});


app.get('/api/user-aval/:username',(req,res)=>{ 
    const usename = req.params.username; 
    const result = User.findOne({ 
        username:usename,
    }).then((result)=>{ 
        if(result == null){ 
            res.status(404).json({ 
                found:false, 
            })
        }
        else{ 
            res.status(200).json({
                found:true,
            })
        }
    })

}); 

//Post``

app.get('/api/posts/', async (req, res) => {
  const { page = 1, limit = 10,userId} = req.query;

  try {
    const posts = await Posts.find({userId:userId})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Posts.countDocuments();

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ 
        message:err.message,
    });
}
});


app.get('/api/posts/', async (req, res) => {
  const { page = 1, limit = 10} = req.query;

  try {
    const posts = await Posts.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Posts.countDocuments();

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ 
        message:err.message,
    });
}
});




app.post('/api/posts/',upload.single('PostImage'),(req,res)=>{ 
    const post = new Posts(
        {
            description:req.body.description,
            userId:req.body.userId, 
            postPath:apiURL+'/'+req.file.path ,
        }
    )
    .save()
    .then((post)=>{ 
        console.log(post) ;
        res.status(201).json({ 
            message:'done',
        })
    })
    .catch((err)=>{ 
        res.status(404).json({ 
            error:err, 
        })
    })
}); 