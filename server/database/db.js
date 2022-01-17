var mongoose = require('mongoose');
var DB_URL = 'mongodb://localhost:27017/chatroom';

// 链接
mongoose.connect(DB_URL);
var db = mongoose.connection;

// 链接成功
db.on('connected', function() {
  console.log('Mongoose connection open to ' + DB_URL);
});

// 链接异常
db.on('error', function(err) {
  console.log('Mongoose connection error:' + err);
});

// 链接断开
db.on('disconnected', function() {
  console.log('Mongoose connection disconnected');
});

module.exports = mongoose;