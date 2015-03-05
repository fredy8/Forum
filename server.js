var express = require('express');
var credentials = require('./server/credentials');
var bodyParser = require('body-parser');
var path = require('path');
var passport = require('passport');

var app = express();

app.set('port', process.env.PORT || 3000);

var dbConnectionString = credentials.mongo[app.get('env')].connectionString;
var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: dbConnectionString });

app.use(require('compression')());
// app.use(require('serve-favicon')(__dirname + '/public/img/favicon.ico'));

if (app.get('env') === 'development') {
	app.use(require('morgan')('dev')); // logger
} else if (app.get('env') === 'production') {
	var logPath = __dirname + '/log/requests.log';
	app.use(require('express-logger')({ path: logPath }));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(function (req, res, next) {
	console.log(req.body);
	next();
});
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'angular-app/app'), {
	extensions: '.ptl.html'
}));
app.use(require('express-session')({
	store: sessionStore,
	secret: credentials.cookieSecret,
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', require('./api/routes/main'));
require('./server/error-handlers')(app);

var server;
var startServer = function () {
	require('mongoose').connect(dbConnectionString, {
		server: { socketOptions: { keepAlive: 1 } }
	}, function () {
		server = require('http').createServer(app).listen(app.get('port'),
			function () {
				console.log('Server started.');
			}
		);
	});
};

app.use(require('./server/error-shutdown')(5000, server));

if (app.get('env') === 'development') {
	console.log('Starting server in %s mode on port %d', app.get('env'),
			app.get('port'));
	startServer();
} else if (app.get('env') === 'production') {
	require('./server/cluster-launcher.js')(startServer, function () {
		console.log('Starting server in %s mode on port %d', app.get('env'),
			app.get('port'));
	});
}