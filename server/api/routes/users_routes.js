var q = require('q');
var passport = require('passport');

module.exports = function (router) {
	var User = require('../models/User');
	var usersController = require('../controllers/users_controller')(User);

	router.post('/register', function (req, res) {
		return usersController.register(req.body);
	});

	router.post('/login', function (req, res, next) {
		return q.Promise(function (resolve, reject) {
			passport.authenticate('local', function (err, user, info) {
				if (err) {
					return reject(err);
				}

				if (!user) {
					return reject();
				}

				req.logIn(user, function (err) {
					if (err) {
						return reject(err);
					}

					resolve();
				});
			})(req, res, next);
		});
	});

	router.post('/logout', function (req, res) {
		return req.logout();
	});
};