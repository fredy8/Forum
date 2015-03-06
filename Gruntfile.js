'use strict';

var angularFiles = [
	'angular-app/app/**/*.js',
];

module.exports = function (grunt) {
	[
		'grunt-cafe-mocha',
		'grunt-contrib-jshint',
		'grunt-exec',
		'grunt-contrib-uglify',
		'grunt-contrib-cssmin',
		'grunt-cssbeautifier',
		'grunt-contrib-watch',
		'grunt-contrib-csslint',
		'grunt-nodemon'
	].forEach(function (task) {
		grunt.loadNpmTasks(task);
	});

	grunt.initConfig({
		cafemocha: {
			all: {
				src: 'test/server/**/*.js', options: { ui: 'bdd' }
			}
		},
		jshint: {
			server: ['server/**/*.js', 'test/**/*.js',
				'Gruntfile.js'],
			client: ['angular-app/**/*.js'],
			options: {
				jshintrc: true
			}
		},
		csslint: {
			csslint: {
				strict: {
					options: {
						csslintrc: '.csslintrc'
					},
					src: ['angular-app/css/**/*.css']
				}
			}
		},
		exec: {
			protractor: {
				cmd: 'protractor tests/angular-app/conf/protractor.conf.js'
			},
			karma: {
				cmd: './node_modules/karma/bin/karma start tests/angular-app/' +
					'conf/karma.conf.js --single-run'
			},
			deleteBinFiles: {
				cmd: 'rm -R public/js; rm -R public/css;' + 
					'mkdir public/js public/css'
			}
		},
		uglify: {
			options: {
				sourceMap: true
			},
			app: {
				files: {
					'public/js/app.js': angularFiles
				}
			},
			plugins: {
				files: {
					'public/js/pugin.js': []
				}
			}
		},
		cssmin: {
			combine: {
				files: {
					'public/css/app.css': ['angular-app/css/**/*.css']
				}
			}
		},
		watch: {
			options: {
				atBegin: true
			},
			bundle: {
				files: angularFiles.concat(['angular-app/css/**/*.css']),
				tasks: ['compile']
			},
			lint: {
				files: ['<%= jshint.server %>',
						'<%= jshint.client %>'],
				tasks: ['csslint', 'jshint']
			}
		},
		nodemon: {
			options: {
				watch: ['server/**/*.js'],
				nodeArgs: ['--debug'],
			},
			dev: {
				script: 'server/server.js'
			}
		}
	});

	grunt.registerTask('test', ['jshint', 'cafemocha']);
	grunt.registerTask('compile', ['exec:deleteBinFiles', 'uglify:app',
		'cssmin', 'cssbeautifier']);
};
