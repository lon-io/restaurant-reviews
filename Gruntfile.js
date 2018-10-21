
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
        cwebp: {
            static: {
              files: {
                // 'dist/img-png.webp': 'src/img.png',
                // 'dist/img-jpg.webp': 'src/img.jpg',
                // 'dist/img-gif.webp': 'src/img.gif'
              }
            },
            dynamic: {
              options: {
                q: 50
              },
              files: [{
                expand: true,
                cwd: 'temp/img',
                src: ['**/*.{png,jpg,gif}'],
                dest: 'temp/webp/'
              }]
            }
          }
    });

    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-cwebp');

    grunt.registerTask('default', ['responsive_images']);
    grunt.registerTask('webp', ['cwebp']);

};
