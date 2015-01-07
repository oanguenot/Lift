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
                    './src/**/*.js',
                    './gruntFile.js',
                    './main.js',
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
                    'log.js',
                    'cookies.js', 
                    'ajax.js',
                    'config.js',
                    'popup.js',
                    'views/mainView.js',
                    'views/configView.js'
                ],
                dest: 'dist/lift.js',
            },
        },

        watch: {
            src: {
                files: 'src/**/*.js',
                tasks: ['build']
            }, 
            naos: {
                files: './vendor/*.js',
                tasks: ['build']
            },
            test: {
                files: 'test/**/*.js',
                tasks: ['test']
            }
            // html: {
            //     file: './*.html',
            //     tasks: ['build']
            // },
            // css: {
            //     file: './css/**/*.css',
            //     tasks: ['build']
            // }
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
        },

        compress: {
            production: {
                options: {
                    archive: 'zip/<%= cfg.name %>-v<%= cfg.version %>.zip'
                },
                files: [
                    {src:['fonts/*.*']},                                // Fonts
                    {src:['css/*.css']},                                // CSS
                    {src:['img/*.*']},                                  // Images
                    {src:['media/*.*']},                                // Terms and conditions
                    {src:['src/**/*.*']},                               // Sources
                    {src:['vendor/*.*']},                               // FOSS
                    {src:['background.js']},                            // Background part of the plugins
                    {src:['LICENSE']},                                  // License
                    {src:['otmeetingmanager_48.png', 'otmeetingmanager_80.png', 'otmeetingmanager_128.png']},  // Plugin icons
                    {src:['manifest.json']},                            // Plugin manifest file
                    {src:['popup.html']},                               // Plugin HTML file
                    {src:['terms.html']},                               // Terms file
                    {src:['details.html']},                               // Terms file
                    {src:['locales/**/*.*']}                            // Locales    
                ]
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
    grunt.loadNpmTasks('grunt-contrib-compress');   // Zip compiled sources

    //### Load custom tasks
    grunt.loadTasks("./grunt");

    //### Main Tasks
    //Execute <code>grunt</code> to launch the default task: <code>watch</code>
    grunt.registerTask('default', ['watch']);

    //Execute all tasks for building the Sonotone.js library
    grunt.registerTask('build', ['concat', 'uglify', 'usebanner', 'jshint', 'compress']);

    grunt.registerTask('test', ['blanket_qunit']);

    grunt.registerTask('zip', ['compress']);

 };