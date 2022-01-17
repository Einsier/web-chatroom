var mongoose = require('./db.js');
var Schema = mongoose.Schema;

// create a model of user
var UserSchema = new Schema({
  username: { type: String },
  password: { type: String },
  phone: { type: String }
});

// export model
module.exports = mongoose.model('User', UserSchema);
