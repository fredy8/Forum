var _ = require('underscore');
var q = require('q');
var bcrypt = require('bcrypt');
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var utils = require('../../server/utils');
var validate = utils.validate;

module.exports = function (User) {
	var register = function (user) {
		validate(_.isObject(user), 'user must be an object');
		validate(_.isString(user.username) &&
			/^[a-z0-9_\.]{4,30}$/i.test(user.username), 'Invalid username');
		validate(_.isString(user.password) && user.password.length >= 6 &&
			user.password.length <= 50, 'Invalid password');

		return User.qCount({ username: user.username })
		.then(function (count) {
			if (count) {
				throw { code: 'conflict',
					message: 'The username already exists.' };
			}
		}).then(function () {
			return q.nfcall(bcrypt.genSalt)
			.then(function (salt) {
				return q.nfcall(bcrypt.hash, user.password, salt)
				.then(function (hashedPassword) {
					var hashedUser = { username: user.username,
						password: hashedPassword, salt: salt };
					return User.qCreate(hashedUser)
					.thenResolve();
				});
			});
		});
	};

	var getUser = function (username, password) {
		return User.qFindOne({ username: username })
		.then(function (user) {
			if (!user) {
				throw { code: 'not found',
					message: 'The user does not exist.' };
			}

			return q.nfcall(bcrypt.hash, password, user.salt)
			.then(function (hashedPassword) {
				if (hashedPassword !== user.password) {
					throw { code: 'authorization',
						message: 'Invalid password.' };
				}

				return user;
			});
		});
	};

	passport.use(new LocalStrategy(function (username, password, done) {
		getUser(username, password)
		.then(function (user) {
			done(null, user);
		}).catch(function (error) {
			done(error, false);
		});
	}));

	passport.serializeUser(function (user, done) {
		done(null, user.username);
	});

	passport.deserializeUser(function (username, done) {
		User.findOne({ username: username }, done);
	});

	return {
		register: utils.wrapFnInPromise(register)
	};
};