var _domain = require('domain');
var cluster = require('cluster');

module.exports = function (shutdownTime, server) {
	return function (req, res, next) {
		var domain = _domain.create();
		domain.on('error', function (err) {
			console.error('DOMAIN ERROR CAUGHT\n', err.stack);
			try {
				setTimeout(function () {
					console.error('Failsafe shutdown.');
					process.exit(1);
				}, shutdownTime || 5000);

				var worker = cluster.worker;
				if(worker) {
					worker.disconnect();
				}

				server.close();

				try {
					next(err);
				} catch (error) {
					console.error('Express error mechanism failed.\n',
						error.stack);
					res.statusCode = 500;
					res.setHeader('content-type', 'text/plain');
					res.end('Server error.');
				}
			} catch (error) {
				console.error('Unable to send 500 response.\n', error.stack);
			}
		});

		domain.add(req);
		domain.add(res);
		domain.run(next);
	};
};