var express = require('express');
const passport = require('passport');
const {Strategy} = require('passport-local');
var router = express.Router();
const userModel = require('./users');
const productModel = require('./product');
const localStrategy = require('passport-local');
const product = require('./product');  
passport.use(new localStrategy(userModel.authenticate()));  
/* GET home page. */

  router.get('/', function(req, res, next) {
    res.render('index', { title: 'MyApp' });
  });

router.get('/profile',isLoggedIn,function(req, res, next) {
 userModel.findOne({username: req.session.passport.user})
 .then(function(user){
  res.render('profile',{user}); 
 })
});

router.get('/login',function(req,res,next){
  res.render('login')
})

router.post('/register', function(req, res, next) {
  var data = new userModel({
     username:req.body.username,
     email:req.body.email,
     photo:req.body.photo   
  })
  userModel.register(data,req.body.password)
  .then(function(createduser){
    passport.authenticate('local')(req,res,function(){
      res.redirect("/profile")
    })  
  })  
});

router.post('/login',passport.authenticate('local',{
  successRedirect:'/profile',
  failureRedirect:'/login' 
  }),function(req,res){})


router.get('/like/:id',isLoggedIn,function(req,res){
  // res.send(req.session.passport.user)
  userModel.findOne({_id:req.params.id})
  .then(function(likehui){
    if(likehui.like.indexOf(likehui._id)=== -1){
      likehui.like.push(likehui._id);
    } 
    else{
      likehui.like.splice(likehui.like.indexOf(likehui._id),1)
    }
    likehui.save()
    .then(function(){
      res.redirect('/allusers')
    })
    })
  });

  function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    }
    else{res.redirect('/login')}
  }

router.get('/edit',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(user){
    res.render('edit',{user});
  })
});

router.get('/allusers',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(user){
    userModel.find()
    .then(function(allusers){
    res.render('allusers',{allusers,user});
  })
  })
});

router.get("/friend/:id",isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinUser){
    userModel.findOne({_id:req.params.id})
  .then(function(jiskoFriendBnanaHai){
    loggedinUser.friends.push(jiskoFriendBnanaHai._id);
    jiskoFriendBnanaHai.friends.push(loggedinUser._id);

    loggedinUser.save().then(function(){
      jiskoFriendBnanaHai.save().then(function(){
        res.redirect("back");
      })
    })
  })
  });
});


router.get('/remove/Friend/:id',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedinUser){
    userModel.findOne({_id:req.params.id})
    .then(function(jisko_splice_krna_hai){
      var index_in_loggedinuser = loggedinUser.friend.indexOf(req.params.id);
      var index_in_anotheraccount = jisko_splice_krna_hai.friend.indexOf(loggedinUser._id);
      loggedinUser.friend.splice(index_in_loggedinuser,1);  
      jisko_splice_krna_hai.friend.splice(index_in_anotheraccount,1);
      loggedinUser.save().then(function(){
        jisko_splice_krna_hai.save().then(function(){
          res.redirect("back")
        })
      })    
    })
  })
})

router.get("/profile/:id",isLoggedIn,function(req,res){
  userModel.findOne({_id:req.params.id})  
    userModel.findOne( function(user){
      res.render("/profile");
    })
})

router.post('/update', isLoggedIn, function(req, res, next) {
  userModel.findOneAndUpdate({username: req.session.passport.user},
    {username:req.body.username, photo: req.body.photo,}) 
  .then(function(user){
  res.redirect("/profile");
  })
});

router.get("/delete",isLoggedIn,function(req,res){
  userModel.findOneAndDelete({username:req.session.passport.user})
  .then(function(deleteduser){
    res.render("allusers",deleteduser);
  })
})

// router.get('/productpage',isLoggedIn,function(req,res){
//   res.render('products');
// })

router.post('/createproduct', isLoggedIn,function(req,res){
    userModel.findOne({username:req.session.passport.user})
    .then(function(user){
     productModel.create({
        userid:user.id,
        name:req.body.name,
        price:req.body.price,
      })
      .then(function(userproduct){
        user.products.push(userproduct._id);
        user.save() 
        .then(function(){
          res.redirect("back")
        })
      })
    })
});

router.get('/allproduct',isLoggedIn,function(req,res){
  userModel.findOne({username : req.session.passport.user})
  .then(function(user ){
    productModel.find().populate("userid")
    .then(function(allUsersproduct){
      res.render("allproducts",{allUsersproduct ,user });
    })
  });  
});


router.get('/cart',isLoggedIn,function(req,res){
  userModel.findOne({username : req.session.passport.user})
  .populate({
    path:'cart',
    populate:{
      path:'userid'
    }})
  .then(function(user){
    res.render('cart',{user})
  })
});

router.get('/cart/:id',isLoggedIn,function(req,res){
  userModel.findOne({username : req.session.passport.user})
  .then(function(user){
    user.cart.push(req.params.id);
    user.save().then(function(){
      res.redirect("back");
    })
  })
});

router.get('/remove/cart/:id',isLoggedIn,function(req,res){
  userModel.findOne({username : req.session.passport.user})
  .then(function(loggedinUser){
    var index = loggedinUser.cart.indexOf(req.params.id);
    loggedinUser.cart.splice(index);
    loggedinUser.save().then(function(){
      res.redirect("back");
    })
  })
})


module.exports = router;


