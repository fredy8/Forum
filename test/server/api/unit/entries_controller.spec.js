var q = require('q');
var _ = require('underscore');
var mongoose = require('mongoose');
var expect = require('chai').expect;
var credentials = require('../../../../server/modules/credentials');

describe('Entries Controller >', function () {

	var Entry, entriesController, validEntry, invalidEntry, username;

	before(function (done) {
		mongoose.connect(credentials.mongo.test.connectionString,
			{ server: { socketOptions: { keepAlive: 1 } } }, done);
	});

	after(function (done) {
		mongoose.disconnect(done);
	});

	beforeEach(function (done) {
		validEntry = { title: 'Mock', content: 'Entry' };
		invalidEntry = { title: 41234, content: 41312 };
		username = 'user123';
		Entry = require('../../../../server/api/models/Entry');
		entriesController =
			require('../../../../server/api/controllers/entries_controller')
			(Entry, done);
	});

	afterEach(function () {
		return Entry.qRemove({});
	});

	it('Creates a new main entry if none exists', function () {
		Entry.qFindOne({ main: true }).then(function (entry) {
			expect(entry.main).to.be.true;
		});
	});

	it('Only one main entry is created.', function () {
		require('../../../../server/api/controllers/entries_controller')(Entry,
			function () {
				Entry.qCount({ main: true }).then(function (count) {
					expect(count).to.equal(1);
				});
			});
	});

	describe('Create Entry >', function () {

		it('should fail when parentId is not an objectId', function () {
			return entriesController
			.create(32749, validEntry, username)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail when entry is not an object', function () {
			return entriesController
			.create('507f1f77bcf86cd799439011', null, username)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail when username is not a string', function () {
			return entriesController
			.create('507f1f77bcf86cd799439011', validEntry, 58298)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('authorization');
			});
		});

		it('should fail when title is not a string and there is no parent',
		function () {
			return entriesController
			.create(null,
				{ title: invalidEntry.title, content: validEntry.content },
				username)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail when content is not a string', function () {
			return entriesController
			.create(null,
				{ title: validEntry.title, content: invalidEntry.content },
				username)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail when the parentId is not found', function () {
			return entriesController
			.create('507f1f77bcf86cd799439011', validEntry, username)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('not found');
			});
		});

		it('should create a new entry', function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function (entryId) {
				return Entry.qFindById(entryId._id);
			}).then(function (entry) {
				expect(entry).to.be.defined;
				expect(entry.title).to.equal(validEntry.title);
				expect(entry.upvotes).to.be.empty;
				expect(entry.downvotes).to.be.empty;
				expect(entry.submissionDate).not.to.undefined;
				expect(entry.op).to.equal(username);
				expect(entry.content).to.equal(validEntry.content);
				expect(entry.childEntries).to.be.empty;
				expect(entry.main).not.to.be.defined;
			}).catch(function (error) { throw error; });
		});

		it('should return the new entry id', function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function (entryId) {
				expect(_.isObject(entryId)).to.be.true;
				_.each(entryId, function (value, key) {
					expect(key).to.equal('_id');
					expect(value).not.to.be.undefined;
				});
			}).catch(function (error) { throw error; });
		});

		it('should create a new entry with no title if there is a parent',
		function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function (parentId) {
				return entriesController.create(parentId._id, validEntry,
					username)
				.then(function (childEntryId) {
					return Entry.qFindById(childEntryId._id);
				});
			}).then(function (entry) {
				expect(entry.title).to.be.undefined;
			}).catch(function (error) { throw error; });
		});

		it('should save a new entry reference in the parent entry',
		function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function (parentId) {
				return entriesController
				.create(parentId._id, validEntry, username)
				.then(function (childEntryId) {
					return Entry.qFindById(parentId._id, 'childEntries')
					.then(function (parentEntry) {
						expect(parentEntry.childEntries)
							.to.include(childEntryId._id);
					});
				});
			}).catch(function (error) { throw error; });
		});

		it('should save the new entry reference in the main entry if there ' +
			'is no parent', function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function (entryId) {
				return Entry.qFindOne({ main: true }, 'childEntries')
				.then(function (mainEntry) {
					expect(mainEntry.childEntries).to.include(entryId._id);
				});
			}).catch(function (error) { throw error; });
		});

	});

	describe('Get All Entries >', function () {

		it('should fail if parentId is not an objectId', function () {
			return entriesController
			.getAll(43214)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should return all child entries of an entry with their properties',
		function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function (parentEntryId) {
				return q.all(
					[entriesController.create(parentEntryId._id, validEntry,
						username),
					entriesController.create(parentEntryId._id, validEntry,
						username)]
				).then(function (childEntryIds) {
					return entriesController
					.getAll(parentEntryId._id)
					.then(function (entries) {
						var obtainedIds = entries.map(function (entry) {
							return entry._id;
						});
						var expectedIds = childEntryIds.map(function (entryId) {
							return entryId._id;
						});

						expect(obtainedIds).to.deep.equal(expectedIds);

						entries.forEach(function (entry) {
							expect(entry._id).not.to.be.undefined;
							expect(entry.title).to.equal(validEntry.title);
							expect(entry.upvotes).to.be.empty;
							expect(entry.downvotes).to.be.empty;
							expect(entry.op).to.equal(username);
							expect(entry.submissionDate).not.to.undefined;
							expect(entry.content).to.equal(validEntry.content);
							expect(entry.childEntries).to.be.empty;
							expect(entry.main).not.to.be.defined;
						});
						
					});
				});
			}).catch(function (error) { throw error; });
		});

		it('should return all top level entries if parentId is not specified.',
		function () {
			return q.all(
				[entriesController.create(null, validEntry, username),
				entriesController.create(null, validEntry, username)]
			).then(function (topLevelEntryIds) {
				return entriesController
				.getAll()
				.then(function (entries) {
					var obtainedIds = entries.map(function (entry) {
						return entry._id;
					});

					var expectedIds = topLevelEntryIds.map(function (entryId) {
						return entryId._id;
					});
					
					expect(obtainedIds).to.deep.equal(expectedIds);
				});
			}).catch(function (error) { throw error; });
		});

		it('should return the vote status if the user is specified.',
		function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function () {
				return entriesController.getAll(null, username);
			}).spread(function (entry) {
				expect(entry.voteStatus).to.equal(0);
				return entriesController.vote(entry._id, 1, username);
			}).then(function () {
				return entriesController.getAll(null, username);
			}).spread(function (entry) {
				expect(entry.voteStatus).to.equal(1);
			}).catch(function (error) { throw error; });
		});

	});

	describe('Vote for an Entry >', function () {

		var entryId;

		beforeEach(function () {
			return entriesController
			.create(null, validEntry, username)
			.then(function (newEntryId) { entryId = newEntryId._id; });
		});

		it('should fail if entryId is not an objectId', function () {
			return entriesController
			.vote(423412, 1, username)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail if vote is not -1, 0, or 1', function () {
			return entriesController
			.vote(entryId, 2, username)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('validation');
			});
		});

		it('should fail if username is not a string', function () {
			return entriesController
			.vote(entryId, 1, 83247)
			.then(function () { expect(false).to.be.true; })
			.catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('authorization');
			});
		});

		it('should fail if the entry does not exist', function () {
			return entriesController
			.vote('507f1f77bcf86cd799439011', 1, username)
			.then(function () {
				expect(false).to.be.true;
			}).catch(function (error) {
				if (!error.code) {
					throw error;
				}

				expect(error.code).to.equal('not found');
			});
		});

		it('should add the user to the upvotes array when upvoted',
		function () {
			return entriesController
			.vote(entryId, 1, username)
			.then(function () {
				return Entry.qFindById(entryId);
			}).then(function (entry) {
				expect(entry.upvotes).to.include(username);
				expect(entry.downvotes).to.be.empty;
			}).catch(function (error) { throw error; });
		});

		it('should add the user to the downvotes array when downvoted',
		function () {
			return entriesController
			.vote(entryId, -1, username)
			.then(function () {
				return Entry.qFindById(entryId);
			}).then(function (entry) {
				expect(entry.upvotes).to.be.empty;
				expect(entry.downvotes).to.include(username);
			}).catch(function (error) { throw error; });
		});

		it('should remove the user from the opposite vote array',
		function () {
			return entriesController
			.vote(entryId, 1, username)
			.then(function () {
				return entriesController.vote(entryId, -1, username);
			}).then(function () {
				return Entry.qFindById(entryId);
			}).then(function (entry) {
				expect(entry.upvotes).to.be.empty;
				expect(entry.downvotes).to.include(username);
				return entriesController.vote(entryId, 1, username);
			}).then(function () {
				return Entry.qFindById(entryId);
			}).then(function (entry) {
				expect(entry.upvotes).to.include(username);
				expect(entry.downvotes).to.be.empty;
			}).catch(function (error) { throw error; });
		});

		it('should remove the user from vote arrays if the status is 0',
		function () {
			return entriesController
			.vote(entryId, 1, username)
			.then(function () {
				return entriesController
				.vote(entryId, 0, username);
			}).then(function () {
				return Entry.qFindById(entryId);
			}).then(function (entry) {
				expect(entry.upvotes).to.be.empty;
				return entriesController.vote(entryId, -1, username);
			}).then(function () {
				return entriesController
				.vote(entryId, 0, username);
			}).then(function () {
				return Entry.qFindById(entryId);
			}).then(function (entry) {
				expect(entry.downvotes).to.be.empty;
			}).catch(function (error) { throw error; });
		});

		it('should not return anything', function () {
			return entriesController
			.vote(entryId, 1, username)
			.then(function (data) { expect(data).to.be.undefined; })
			.catch(function (error) { throw error; });
		});

	});
});