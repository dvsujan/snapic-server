//Post``
const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const Posts = require('../models/posts'); 
const User = require('../models/User'); 
const checkAuth = require('../middleware/checkAuth')
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



router.get('/',checkAuth, async (req, res) => {
  const { page = 1, limit = 10} = req.query;
  try {
    const posts = await Posts.find({userId:req.body.userId})
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

router.post('/',checkAuth,upload.single('PostImage'),(req,res)=>{ 
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
      .then(psts=>{
        const count =  Posts.countDocuments().then(count=>{ 
          res.status(201).json({
            psts,
            totalPages: Math.ceil(count / limit),
            currentPage: page
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