module.exports = function (config) {
	config.set({
		basePath: '../../../',
		files: [],
		autoWatch: false,
		frameworks: ['jasmine'],
		browsers: ['Chrome'],
		plugins: [
					'karma-chrome-launcher',
					'karma-firefox-launcher',
					'karma-jasmine',
					'karma-junit-reporter'
				  ],
		junitReporter: {
			outputFile: 'test_out/unit.xml',
			suite: 'unit'
		}
	});
};