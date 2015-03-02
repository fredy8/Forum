var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var promisifyModel = require('../../server/promisify-model');

var EntrySchema = new Schema({
	title: String,
	upvotes: { type: [String], default: [] },
	downvotes: { type: [String], default: [] },
	op: String,
	submissionDate: { type: Date, required: true, default: Date.now },
	content: { type: String, required: true },
	childEntries: [{ type: Schema.Types.ObjectId, ref: 'Entry'}],
	main: Boolean // true only for the parent of all top level entries
});

module.exports = promisifyModel('Entry', EntrySchema);