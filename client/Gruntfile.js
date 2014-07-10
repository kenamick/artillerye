// Generated on 2014-03-28 using generator-phaser-official 0.0.8-rc-2
'use strict';
var config = require('./config.json');
var _ = require('underscore');
_.str = require('underscore.string');

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    watch: {
      scripts: {
        files: [
            'index.html',
            'game/**/*.js',
            '!game/main.js',
            'config.json',
            '../shared/*.js'
        ],
        options: {
          spawn: false,
          livereload: LIVERELOAD_PORT
        },
        tasks: ['build']
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'build')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:9000'
      }
    },
    /**
     * Clean-up of built/copied resources
     */
    clean: {
      build: [
        'build/*'
      ],
      dist: [
        'dist/*'
      ]
    },
    /**
     * Copy files for testing (build) and for production (dist)
     */
    copy: {
      build: {
        files: [
          // includes files within path and its sub-directories
          { expand: true, src: ['assets/**'], dest: 'build/' },
          { expand: true, flatten: true, src: ['game/plugins/*.js'], dest: 'build/js/plugins/' },
          { expand: true, flatten: true, src: ['bower_components/**/build/*.js'], dest: 'build/js/' },
          { expand: true, flatten: true, src: ['bower_components/**/dist/*.js'], dest: 'build/js/' },
          { expand: true, flatten: true, src: ['bower_components/socket.io-client/socket.io.js'], dest: 'build/js/' },
          { expand: true, src: ['css/**'], dest: 'build/' },
          { expand: true, src: ['index.html'], dest: 'build/' }
        ]
      },
      dist: {
        files: [
          { expand: true, cwd: 'build/', src: ['assets/**'], dest: 'dist/' },
          { expand: true, cwd: 'build/', src: ['css/**'], dest: 'dist/' },
          { expand: true, cwd: 'build/', src: ['js/phaser.min.js'], dest: 'dist/' }
        ]
      }
    },
    browserify: {
      build: {
        src: ['game/main.js'],
        dest: 'build/js/game.js'
      }
    },
    /**
     * Minify js code
     */
    uglify: {
      options: {
        report: 'min',
        preserveComments: false
      },
      dist: {
        files: {
          'dist/js/game.min.js': ['build/js/game.js'],
          'dist/js/socket.io.min.js': ['build/js/socket.io.js']
        }
      }
    },
    processhtml: {
      options: {
        data: {
          message: 'Hello world!'
        }
      },
      dist: {
        files: {
          'dist/index.html': ['index.html']
        }
      }
    },
    jshint: {
      options: {
        jshintrc: ".jshintrc"
      },
      beforeConcat: {
        files: {
          src: ['game/*.js', 'game/states/*.js']
        }
      }
    },
  });

  grunt.registerTask('build', ['buildBootstrapper', 'browserify', 'copy:build']);
  grunt.registerTask('serve', ['build', 'connect:livereload', 'open', 'watch']);
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('prod', ['jshint', 'clean', 'build', 'uglify', 'copy:dist', 'processhtml']);

  grunt.registerTask('buildBootstrapper', 'builds the bootstrapper file correctly', function() {
    var stateFiles = grunt.file.expand('game/states/*.js');
    var gameStates = [];
    var statePattern = new RegExp(/(\w+).js$/);
    stateFiles.forEach(function(file) {
      var state = file.match(statePattern)[1];
      if (!!state) {
        gameStates.push({shortName: state, stateName: _.capitalize(state) + 'State'});
      }
    });
    config.gameStates = gameStates;
    console.log(config);
    var bootstrapper = grunt.file.read('templates/_main.js.tpl');
    bootstrapper = grunt.template.process(bootstrapper,{data: config});
    grunt.file.write('game/main.js', bootstrapper);
  });
};
