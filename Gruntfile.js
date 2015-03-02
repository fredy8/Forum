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
		'grunt-hashres',
		'grunt-contrib-csslint',
		'grunt-nodemon'
	].forEach(function (task) {
		grunt.loadNpmTasks(task);
	});

	// configure plugins
	grunt.initConfig({
		cafemocha: {
			all: {
				src: 'test/**/*.js', options: { ui: 'bdd' }
			}
		},
		jshint: {
			server: ['server.js', 'server/**/*.js', 'test/**/*.js',
				'Gruntfile.js'],
			api: ['api/**/*.js'],
			frontend: ['angular-app/**/*.js'],
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
			linkchecker: {
				cmd: 'linkchecker http://localhost:3000 -q --no-warnings'
			},
			protractor: {
				cmd: 'protractor angular-app/tests/conf/protractor.conf.js'
			},
			karma: {
				cmd: './node_modules/karma/bin/karma start angular-app' +
					'/tests/conf/karma.conf.js --single-run'
			},
			deleteBinFiles: {
				cmd: 'rm -R public/js; rm -R public/css;' + 
					'mkdir public/js public/css'
			}
		},
		uglify: {
			options: {
				beautify: true,
				preserveComments: 'all',
				report: 'gzip'
			},
			beautify: {
				files: {
					'public/js/app.js': angularFiles
				}
			},
			minify: {
				options: {
					beautify: false,
					compress: {
						unused: false
					},
					preserveComments: false
				},
				files: {
					'public/js/app.js': angularFiles
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
		cssbeautifier : {
			files : ['public/css/**/*.css'],
		},
		hashres: {
			jsHash: {
				src: ['public/js/app.js'],
				dest: 'public/index.html'
			},
			cssHash: {
				src: ['public/css/app.css'],
				dest: 'public/index.html'
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
						'<%= jshint.api %>',
						'<%= jshint.frontend %>'],
				tasks: ['csslint', 'jshint']
			}
		},
		nodemon: {
			options: {
				watch: ['server.js', 'server/**/*.js', 'api/**/*.js'],
				ignore: ['**/*.test.js'],
				nodeArgs: ['--debug'],
			},
			dev: {
				script: 'server.js'
			}
		}
	});

	// register tasks
	grunt.registerTask('test', ['jshint', 'cafemocha']);
	grunt.registerTask('compile', ['exec:deleteBinFiles', 'uglify:beautify',
		'cssmin', 'cssbeautifier']);
};
