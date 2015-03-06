module.exports = function (router) {
	var Entry = require('../models/Entry');
	var entriesController = require('../controllers/entries_controller')(Entry);

	router.get('/entries', function (req, res) {
		return entriesController.getAll(req.query.parent,
			req.user ? req.user.username : undefined);
	});

	router.post('/entries', function (req, res) {
		return entriesController.create(req.query.parent, req.body,
			req.user ? req.user.username : undefined);
	});

	router.put('/entries/:id/vote', function (req, res) {
		return entriesController.vote(req.params.id, req.body.status,
			req.user ? req.user.username : undefined);
	});
};