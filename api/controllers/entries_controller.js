var _ = require('underscore');
var utils = require('../../server/utils');
var validate = utils.validate;

// for all methods, username is assumed to be a valid user to avoid an extra
// roundtrip to the db
module.exports = function (Entry, done) {
	var mainEntryId;
	Entry.qFindOneAndUpdate({ main: true }, { main: true }, { upsert: true })
	.then(function (mainEntry) {
		mainEntryId = mainEntry._id;
	}).catch(function (error) {
		throw error;
	}).finally(done);

	var getAll = function (parentId, username) {
		parentId = parentId || mainEntryId;

		validate(utils.isObjectId(parentId), 'parentId must be an object id');
		
		var projection = {
			title: 1, submissionDate: 1, content: 1, childEntries: 1, op: 1,
			upvotes: { $size: '$upvotes' }, downvotes: { $size: '$downvotes' }
		};

		if (username) {
			validate(_.isString(username), 'username must be a string');
			projection.voteStatus = {
				$cond: {
					if: { $setIsSubset: [[username], '$upvotes'] },
					then: 1,
					else: {
						$cond: {
							if: { $setIsSubset: [[username], '$downvotes'] },
							then: -1,
							else: 0
						}
					}
				}
			};
		}

		return Entry.qFindById(parentId, 'childEntries')
		.then(function (parentEntry) {
			if (!parentEntry) {
				throw { code: 'not found' };
			}

			return Entry.qAggregate(
				{ $match: { _id: { $in: parentEntry.childEntries } } },
				{ $project: projection }
			);
		});
	};

	var create = function (parentId, entry, username) {
		parentId = parentId || mainEntryId;

		validate(utils.isObjectId(parentId), 'parentId must be an object id');
		validate(_.isObject(entry), 'entry must be an object');
		if(!_.isString(username)) {
			throw { code: 'authorization' };
		}
		
		if (parentId === mainEntryId) {
			validate(_.isString(entry.title), 'entry.title must be a string');
		} else {
			delete entry.title;
		}

		validate(_.isString(entry.content), 'entry.content must be a string');

		entry.op = username;

		return Entry.qCount({ _id: parentId })
		.then(function (count) {
			if (!count) {
				throw { code: 'not found' };
			}
		})
		.then(function () {
			return Entry.qCreate(_.pick(entry, 'title', 'content', 'op'))
			.then(function (newEntry) {
				return Entry.qUpdate({ _id: parentId },
					{ $push: { childEntries: newEntry._id } })
					.thenResolve({ _id: newEntry._id });
			});
		});
	};

	var vote = function (entryId, vote, username) {
		validate(utils.isObjectId(entryId), 'entryId must be an object id');
		validate(_.contains([-1, 0, 1], vote), 'vote must be -1, 0 or 1');
		if(!_.isString(username)) {
			throw { code: 'authorization' };
		}

		var addToSet = {}, pull = {};

		if (vote) {
			addToSet[vote === 1 ? 'upvotes' : 'downvotes'] = username;
			pull[vote === 1 ? 'downvotes' : 'upvotes'] = username;
		} else {
			pull.upvotes = pull.downvotes = username;
		}

		var update = { $pull: pull };
		if (_.size(addToSet)) {
			update.$addToSet = addToSet;
		}

		return Entry.qFindByIdAndUpdate(entryId, update)
		.then(function (found) {
			if (!found) {
				throw { code: 'not found' };
			}
		});
	};

	return {
		getAll: utils.wrapFnInPromise(getAll),
		create: utils.wrapFnInPromise(create),
		vote: utils.wrapFnInPromise(vote)
	};
};