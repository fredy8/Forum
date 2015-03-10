var q = require('q');
var router = require('express').Router();

var routes = [
	'users_routes',
	'entries_routes',
	'error_routes'
];

var addRoute = function (method, route, handler) {
	router[method](route, function (req, res, next) {
		q.when(handler(req, res))
		.then(function (result) {
			result ? res.json(result) : res.end();
		}).fail(function (error) {
			next(!error || error.code === 'not found' ? undefined : error);
		});
	});
};

var methods = ['get', 'post', 'put', 'delete', 'use'];
var promiseRouter = {};

methods.forEach(function (method) {
	promiseRouter[method] = function (route, handler) {
		return addRoute(method, route, handler);
	};
});

routes.forEach(function (route) {
	require('./' + route)(promiseRouter);
});

module.exports = router;