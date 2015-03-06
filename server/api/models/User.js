var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var promisifyModel = require('../../../server/modules/promisify-model');

var UserSchema = new Schema({
	username: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	salt: { type: String, required: true }
});

module.exports = promisifyModel('User', UserSchema);