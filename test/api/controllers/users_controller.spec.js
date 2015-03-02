var q = require('q');
var mongoose = require('mongoose');
var expect = require('chai').expect;
var credentials = require('../../../server/credentials');

describe('Users Controller >', function () {

	before(function (done) {
		mongoose.connect(credentials.mongo.test.connectionString,
			{ server: { socketOptions: { keepAlive: 1 } } }, done);
	});

	after(function (done) {
		mongoose.disconnect(done);
	});

	var User, usersController, validUser, invalidUser;

	beforeEach(function () {
		validUser = { username: 'user123', password: 'password123' };
		invalidUser = { username: 41234, password: 41312 };
		User = require('../../../api/models/User');
		usersController =
			require('../../../api/controllers/users_controller')(User);
	});

	afterEach(function () {
		return User.qRemove({});
	});

	describe('Register User >', function () {

		it('should fail if the user is not an object', function () {
			return usersController
			.register(null)
			.then(function () { expect(false).to.be.true; })
			.fail(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail if the username is invalid', function () {
			return usersController
			.register({ username: invalidUser.username,
				password: validUser.password })
			.then(function () { expect(false).to.be.true; })
			.fail(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail if the password is invalid', function () {
			return usersController
			.register({ username: validUser.username,
				password: invalidUser.password })
			.then(function () { expect(false).to.be.true; })
			.fail(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail if the user already exists', function () {
			return usersController
			.register(validUser)
			.then(function () {
				usersController
				.register(validUser)
				.then(function () { expect(false).to.be.true; })
				.fail(function (error) {
					if (!error.code) {
						throw error;
					}

					expect(error.code).to.equal('conflict');
				});
			}).fail(function (error) { throw error; });
		});

		it('should create a user', function () {
			return usersController
			.register(validUser)
			.then(function () {
				return User.qFind({ username: validUser.username });
			}).then(function (user) {
				expect(user).to.be.defined;
				expect(user.password).to.be.defined;
			}).fail(function (error) { throw error; });
		});

		it('should not save the exact password', function () {
			return usersController
			.register(validUser)
			.then(function () {
				return User.qFind({ username: validUser.username });
			}).then(function (user) {
				expect(user.password).not.to.equal(validUser.password);
			});
		});

		it('should generate different salts for different users', function () {
			var validUser2 = { username: 'User1234', password: 'password123' };
			q.all([usersController.register(validUser),
				usersController.register(validUser2)])
			.spread(function (user1, user2) {
				expect(user1.salt).not.to.equal(user2.salt);
			});
		});

	});
});