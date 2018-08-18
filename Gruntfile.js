
module.exports = function(grunt) {

    grunt.initConfig({
        responsive_images: {
            dev: {
                options: {
                    sizes: [{
                        name: 'sm',
                        width: 320,
                    },{
                        name: 'md',
                        width: 640,
                    },{
                        name: "lg",
                        width: 800,
                    }],
                },
                files: [{
                    expand: true,
                    src: ['**.{jpg,gif,png}'],
                    cwd: 'src/assets/img',
                    dest: 'temp/img'
                }]
            }
        },
    });

    grunt.loadNpmTasks('grunt-responsive-images');

    grunt.registerTask('default', ['responsive_images']);

};
