module.exports = function (app) {
	
	app.use(function (req, res, next) {
		res.status(404);
		res.send('Error: 404');
	});

	app.use(function (err, req, res, next) {
		if (err.code !== 'EBADCSRFTOKEN') {
			return next(err);
		}

		res.status(403);
		res.send('Session has expired.');
	});

	app.use(function (err, req, res, next) {
		console.error(err.stack);
		res.status(err.status || 500);
		res.send('Error: ' + res.statusCode);
	});
};