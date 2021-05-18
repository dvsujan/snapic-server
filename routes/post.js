//Post``
const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const Posts = require('../models/posts'); 
const User = require('../models/User'); 
const checkAuth = require('../middleware/checkAuth');
const imager = require('multer-imager');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');  

require('dotenv').config()

apiURL = 'localhost:5000'

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './HQPost/');
  },
  filename: function(req, file, cb) {
    cb(null,makeid(10)+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20
  },
  fileFilter: fileFilter
});



router.get('/',checkAuth, async (req, res) => {
  const { page = 1, limit = 10} = req.query;
  try {
    const posts = await Posts.find({userId:req.userData.userId})
      .limit(limit * 1)
      .sort({"createdAt": -1}) 
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

router.get('/usr',checkAuth,async(req,res)=>{ 
  const userId = req.userData.userId;
  const username = req.userData.username;
  const { page = 1, limit = 10} = req.query;
    User.findById(userId).then((result)=>{ 
    if(result){ 
      const following = result.following; 
      const followers = result.followers; 
      const dp = result.DP;  
      const bio = result.bio;  
      res.status(200).json({ 
          username:username, 
          followers:followers,  
          following:following, 
          DP:dp, 
          bio:bio, 
        });
    }
    }).catch((err)=>console.log(err)) ;
});  

router.post('/like/:postId',checkAuth ,async (req,res)=>{ 
  const userId = req.userData.userId ; 
  const postId = req.params.postId ; 
  const Post = await Posts.findByIdAndUpdate(postId,{
    $addToSet:{likes:userId}, 
  }).then(()=>{ 
    res.status(200).json({ 
      message:'success',
    })
  }) 
  .catch((err)=>{ 
    console.log(err)
    res.status(400).json({ 
      message:'error occured',  
    })
  })
})

router.get('/all',async (req, res) => {
  const { page = 1, limit = 10} = req.query;

  try {
    const posts = await Posts.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({"createdAt": -1}) 
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

router.post('/',checkAuth,upload.single('PostImage'),async(req,res)=>{ 
  console.log(req.body);  
  const FinalPath = './posts/'+makeid(10)+'resized'+req.file.originalname;
  const { filename: PostImage } = req.file;
  console.log(PostImage);
       await sharp(req.file.path)
        .jpeg({ quality: 50 })
        .toFile(FinalPath)
        fs.unlinkSync(req.file.path); 
  
        const post = new Posts(
        {
            description:req.body.description,
            userId:req.userData.userId,
            postPath:FinalPath.replace('.',''),
        }
    )
    .save()
    .then((post)=>{ 
        res.status(201).json({ 
            message:'done',
        })
    })
    .catch((err)=>{ 
      console.log(err);    
      res.status(404).json({ 
            error:err,
        })
    })
}); 


router.get('/:username',(req,res)=>{
  const { page = 1, limit = 10} = req.query;
  const user = User.findOne({username:req.params.username}).then((user)=>{ 
    if(user){
      const Id = user._id;
      psts = Posts.find({ 
        userId:Id,
      })
      .limit(limit * 1)
      .skip((page - 1) * limit) 
      .then(posts=>{
        const count =  Posts.countDocuments().then(count=>{ 
          res.status(201).json({
            posts,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalResults:count,
          });
        }
        );
       
      }) 
    }
    else{ 
      res.status(404).json({ 
        message:"user Not found", 
      })
    } 
  })
});

module.exports = router; 