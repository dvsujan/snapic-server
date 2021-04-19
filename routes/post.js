//Post``
const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const User = require('../models/User'); 
const Posts = require('../models/posts'); 
apiURL = 'localhost:5000'

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './Posts/');
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
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});



router.get('/', async (req, res) => {
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


router.get('/all', async (req, res) => {
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


router.post('/',upload.single('PostImage'),(req,res)=>{ 
    const post = new Posts(
        {
            description:req.body.description,
            userId:req.body.userId, 
            postPath:apiURL+'/'+req.file.path ,
        }
    )
    .save()
    .then((post)=>{ 
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


module.exports = router; 