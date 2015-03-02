var mongoose = require('mongoose');
var q = require('q');

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