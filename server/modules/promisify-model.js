var mongoose = require('mongoose');
var q = require('q');

/**
 * Creates a mongoose model from a schema and extends it for support with q
 * promises. Q supported methods are equivalent in functionality to mongoose
 * model's methods and start with a q. These methods return a promise instead
 * of requiring a callback.
 */
module.exports = function (name, schema) {
	var model = mongoose.model(name, schema);
	
	var methods = ['find', 'findOne', 'findById', 'create', 'update',
		'findOneAndUpdate', 'findByIdAndUpdate', 'count', 'remove',
		'aggregate'];

	methods.forEach(function (method) {
		model['q' + method[0].toUpperCase() + method.slice(1)] =
			q.nbind(model[method], model);
	});

	return model;
};