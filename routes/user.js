// USER INFO
const express = require('express');
const { modelNames } = require('mongoose');
const router = express.Router();
const multer = require('multer')
const User = require('../models/User'); 
const Posts = require('../models/posts'); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
require('dotenv').config()
apiURL = 'localhost:5000'

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

const Dpupload = multer({ 
    storage:dpstorage,
    limit:{ 
        filesize:1024*1024*1,
    },
    fileFilter:fileFilter,
})

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

router.get('/:id',(req,res,next)=>{ 
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

router.post("/signup", Dpupload.single('ProfileImg'),(req, res, next) => {
    User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              email: req.body.email,
              password: hash,
              username:req.body.username, 
              first_name:req.body.first_name , 
              last_name:req.body.last_name, 
              DP:apiURL+'/'+req.file.path ,
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.patch('/',(req, res)=>{ 
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

router.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id, 
              username:user[0].username,
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth successful",
            token: token
          });
        }
        res.status(401).json({
          message: "Auth failed"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "User deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


router.get('/get-followers/:userid',(req,res,next)=>{ 
    id = req.params.userid; 
    User.findById(id)
    .then(function(user) {
        return res.json(user.following);
    })
    .catch(function(err) {
        return res.json(err);
    });     
});  

router.get('/getid/:username',(req,res,next)=>{ 
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

router.post('/follow',(req,res,next)=>{
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


router.get('/user-aval/:username',(req,res,next)=>{ 
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


module.exports = router; 