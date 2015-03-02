exports.mongo = {
	development: {
		connectionString:
			'mongodb://localhost:27017/forum'
	},
	production: {
		connectionString:
			'mongodb://localhost:27017/forum'
	},
	test: {
		connectionString:
			'mongodb://localhost:27017/forum-test'
	}
};

exports.cookieSecret = 'meryt3q9m4x8wbc6rpt3x94cq43xny89x8n34yfsacaoscd34';