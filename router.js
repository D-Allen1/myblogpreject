var express = require('express')
var User = require('./models/user')   //数据库的一些方法
var router= express.Router()  //app里面已经有Router方法直接用就行
var md5 = require('blueimp-md5')

  
router.get('/',function(req,res){
    res.render('index.html',{
        user:req.session.user
    })
})

router.get('/login', function (req, res) {
    res.render('login.html')
  })

router.post('/login',function(req,res){
    var body = req.body
    User.findOne({
        email :body.email,
        password:md5(md5(body.password))
        },
    function(err,user){
        if(err){
            return res.status(500).json({
                err_code:500,
                message: err.message 
            })
        }
        if(!user){
            return res.status(200).json({
                err_code:1,
                message:'Email or password is invalid'
            })
        }
        req.session.user = user
        res.status(200).json({
            err_code:0,
            message:'ok'
        })
    })
})
  router.get('/register', function (req, res) {
    res.render('register.html')
  }) 
  router.post('/register',function(req,res){
      var body = req.body
      User.findOne({
          $or:[{
              email:body.email
          },
          {nickname: body.nickname}]
      },function(err,data){
          if(err){
              return res.status(500).json({
                  success:false,
                  message: '服务端错误'
              })
          }
          if(data){
              return res.status(200).json({
                  err_code:1,
                  message:'Email or nickname already exists.'
              })
              return res.send('邮箱或者密码已存在，请重试')
          }
          body.password = md5(md5(body.password))
          new User(body).save(function(err,user){
              if(err){
                  return res.status(500).json({
                      err_code:500,
                      message:'Internal error.'
                  })
              }
              req.session.user = user
              res.status(200).json({
                  err_code:0,
                  message:'ok'
              })
          })
      })
  })
  router.get('/logout',function(req,res){
      req.session.user = null
      res.redirect('/login')
  })
  
  module.exports = router
