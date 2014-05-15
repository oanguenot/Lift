// This Gruntfile defines the list of automation tasks that can be launched when developping, testing or producing new version of SonotoneJS
module.exports = function(grunt) {
   "use strict";
    grunt.initConfig({

        //### Get Configuration data
        cfg: grunt.file.readJSON('package.json'),

        license: grunt.file.read('LICENSE'),

        jshint: {
            dist: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: [
                    //'*.js',
                    './dist/lift.js',
                    './vendor/ics/js',
                    './GruntFile.js',
                    './package.json'
                ]
            },
        },

         concat: {
            options: {
                separator: '',
                banner: '(function(){',
                footer: '}).call(this);',
            },
           
            dist: {
                src: [
                    'cookies.js', 
                    'ajax.js',
                    'config.js',
                    'popup.js'
                ],
                dest: 'dist/lift.js',
            },
        },

        watch: {
            src: {
                files: '*.js',
                tasks: ['concat', 'uglify', 'usebanner', 'jshint']
            }, 
            naos: {
                files: './vendor/*.js',
                tasks: ['concat', 'uglify', 'usebanner', 'jshint']
            },
            test: {
                files: 'test/**/*.js',
                tasks: ['test']
            }
        },

        usebanner: {
            dist: {
                options: {
                    position: 'top',
                    banner: '/* \n\n' +
                            '<%= cfg.name %> - v<%= cfg.version %>' + '\n<%= cfg.description %>' + '\nBuild date <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                            '<%= license %>' +
                            '\n\n*/\n'
                },
                files: {
                    src: [ 'dist/lift.js', 'dist/lift-min.js' ]
                }
            }
        },

        uglify: {
            options: {
                sourceMap: 'dist/lift-map.js',
                beautify: false,
                compress: true,
                report: 'gzip'
            },
            dist: {
                files: {
                    'dist/lift-min.js': ['dist/lift.js']
                }
            }
        },

        blanket_qunit: {
            all: {
                options: {
                    urls: ['test/run.html?coverage=true&gruntReport'],
                    threshold: 10
                }
            }
        }


    });

    //### Load Grunt plugins
    //These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');      // Clean directories
    grunt.loadNpmTasks('grunt-contrib-jshint');     // Code source Linter
    grunt.loadNpmTasks('grunt-contrib-watch');      // Code source Watcher
    grunt.loadNpmTasks('grunt-contrib-concat');     // Code source concat
    grunt.loadNpmTasks('grunt-banner');             // License
    grunt.loadNpmTasks('grunt-contrib-uglify');     // Code source uglification
    grunt.loadNpmTasks('grunt-contrib-qunit');      // For Qunit/SinonJS tests
    grunt.loadNpmTasks('grunt-blanket-qunit');      // For Code coverage

    //### Main Tasks
    //Execute <code>grunt</code> to launch the default task: <code>watch</code>
    grunt.registerTask('default', ['watch']);

    //Execute all tasks for building the Sonotone.js library
    grunt.registerTask('build', ['concat', 'uglify', 'usebanner', 'jshint']);

    grunt.registerTask('test', ['blanket_qunit']);

 };