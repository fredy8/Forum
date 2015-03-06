var cluster = require('cluster');

function startWorker() {
	var worker = cluster.fork();
	console.log('Worker %d started.', worker.id);
}

module.exports = function (startServer, init) {
	if(cluster.isMaster) {
		init();

		require('os').cpus().forEach(function () {
			startWorker();
		});

		cluster.on('disconnect', function (worker) {
			console.log('Worker %d disconnected from the cluster.', worker.id);
		});

		cluster.on('exit', function (worker, code, signal) {
			console.log('Worker %d died with exit code %d (%s)', worker.id,
				code, signal);
			startWorker();
		});
	} else {
		startServer();
	}
};