var express = require('express');
var router = express.Router();

// get the model of user
var User = require('../database/user_model');

/* login */
router.get('/login', function(req, res, next) {
  User.find({
    username: req.query.username,
    password: req.query.password
  }, (err, docs) => {
    if (err) {
      res.send({ success: false, message: '系统错误！' });
    } else if (docs.length == 0) {
      res.send({ success: false, message: '此用户不存在！' });
    } else {
      res.send({ data: docs[0], success: true, message: '登录成功！' });
    }
  });
});

/* register */
router.post('/register', function(req, res, next) {
  User.find({
    username: req.query.username
  }, (err, docs) => {
    if (err) {
      res.send({success: false, message: '系统错误！' });
    } else if (docs.length == 0) {
      new User({
        username: req.query.username,
        password: req.query.password,
        phone: req.query.password
      }).save((err) => {
        if (err) {
          res.send({ success: false, message: '注册失败！' });
        } else {
          res.send({ success: true, message: '注册成功！' });
        }
      });
    } else {
      res.send({ success: false, message: '此用户已存在，请登录！' });
    }
  });
});


module.exports = router;
