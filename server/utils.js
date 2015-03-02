var q = require('q');

exports.validate = function (valid, message) {
	if (!valid) {
		throw { code: 'validation', message: message || 'Validation error.' };
	}
};

exports.isObjectId = function (value) {
	return value && /^[0-9a-fA-F]{24}$/.test(value.toString());
};

exports.wrapFnInPromise = function (fn) {
	return function () {
		var args = Array.prototype.slice.call(arguments);
		return q.Promise(function (resolve, reject) {
			try {
				q.when(fn.apply(null, args))
				.then(resolve)
				.fail(reject);
			} catch (error) {
				reject(error);
			}
		});
	};
};