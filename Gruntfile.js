module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    var srcFiles = [
            '<%= dirs.src %>/util/rng.js',
            '<%= dirs.src %>/util/cartography.js',
            '<%= dirs.src %>/util/astar.js',
            '<%= dirs.src %>/generator/cell.js',
            '<%= dirs.src %>/generator/stairs.js',
            '<%= dirs.src %>/generator/door.js',
            '<%= dirs.src %>/generator/room.js',
            '<%= dirs.src %>/generator/floor.js',
            '<%= dirs.src %>/generator/dungeon.js'
        ];

        var banner = [
            '/**',
            ' * <%= pkg.name %> - v<%= pkg.version %>',
            ' * Copyright (c) 2014, Jorge Perez (<%= pkg.homepage %>)',
            ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
            ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License (<%= pkg.licenseUrl %>)',
            ' */',
            ''
        ].join('\n');

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        dirs: {
            build: 'bin',
            src: 'src',
        },
        files: {
            build: '<%= dirs.build %>/rdg.dev.js',
            buildMin: '<%= dirs.build %>/rdg.min.js'
        },
        clean: ['<%= dirs.build %>'],
        concat: {
            options: {
                banner: banner
            },
            dist: {
                src: srcFiles,
                dest: '<%= files.build %>'
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            dist: {
                src: '<%= files.build %>',
                dest: '<%= files.buildMin %>'
            }
        }
    });

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['clean', 'concat', 'uglify']);

};
