/**
 * Artillerye server build file
 *
 */

'use strict';

var request = require('request');

module.exports = function (grunt) {

  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35727, files;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // develop: {
    //   server: {
    //     file: 'app.js'
    //   }
    // },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [
          'Gruntfile.js',
          'app.js',
          'routes/*.js'
        ],
        tasks: ['develop'], //, 'delayed-livereload']
      }/*,
      js: {
        files: ['public/js/*.js'],
        options: {
          livereload: reloadPort
        }
      },
      css: {
        files: ['public/css/*.css'],
        options: {
          livereload: reloadPort
        }
      },
      jade: {
        files: ['views/*.jade'],
        options: {
          livereload: reloadPort
        }
      }*/
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          args: ['dev'],
          // nodeArgs: ['--debug'],
          watchedExtensions: ['js', 'json'],
          ignore: ['node_modules/**', 'client/**'],
        }
      }
    },
    jshint: {
      options: { jshintrc: ".jshintrc" },
      beforeConcat: {
        files: {
          src: ['app.js', 'server/*.js', 'shared/*.js']
        }
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
          { expand: true, src: ['server/**/*.js', 'shared/**/*.js'], dest: 'build/' },
          { expand: true, src: ['app.js', '.gitignore', 'package.json', 'LICENSE'], dest: 'build/' },
        ]
      },
      dist: {
        files: [
          { expand: true, cwd: 'build/', src: ['**'], dest: 'dist/' },
          { expand: true, cwd: 'client/dist/', src: ['**'], dest: 'dist/client' }
        ]
      }
    },
    /**
     * Invoke client grunt build to produce distributable
     */
    run_grunt: {
      options: {
        minimumFiles: 1
      },
      prod: {
        options: {
          log: true,
          task: ['prod']
        },
        src: ['./client/Gruntfile.js']
      }
    }
  });

  grunt.config.requires('watch.server.files');
  files = grunt.config('watch.server.files');
  files = grunt.file.expand(files);

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async();
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200;
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.');
          } else {
            grunt.log.error('Unable to make a delayed live reload.');
          }
          done(reloaded);
        });
    }, 500);
  });

  grunt.registerTask('default', ['nodemon']);
  grunt.registerTask('build', ['jshint', 'clean:build', 'copy:build']);
  grunt.registerTask('prod', ['build', 'run_grunt', 'clean:dist', 'copy:dist']);
};
