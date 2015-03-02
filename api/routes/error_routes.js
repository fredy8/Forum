module.exports = function (router) {

	// 404 Not Found
	router.use(function (req, res, next) {
		res.status(404);
		res.json({ error: '404 - Not found.' });
	});

	// 400 Bad request
	router.use(function (err, req, res, next) {
		if (err.code !== 'validation') {
			return next(err);
		}

		res.status(400);
		res.json({ error: '400 - Bad Request', details: err.message });
	});

	// 401 Authorization
	router.use(function (err, req, res, next) {
		if (err.code !== 'authorization') {
			return next(err);
		}

		res.status(401);
		res.json( { error: '401 - Unauthorized', details: err.message });
	});

	// 409 Conflict
	router.use(function (err, req, res, next) {
		if (err.code !== 'conflict') {
			return next(err);
		}

		res.status(409);
		res.json({ error: '409 - Conflict', details: err.message });
	});

	// 500 Internal Server Error
	router.use(function (err, req, res, next) {
		console.error(err.stack);
		res.status(500);
		res.json({ error: '500 - Internal Server Error' });
	});
};