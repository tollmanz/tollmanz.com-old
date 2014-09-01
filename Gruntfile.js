/* jshint node:true */
module.exports = function( grunt ) {
  // Load all Grunt tasks
  require( 'load-grunt-tasks' )( grunt );

  // Project configuration.
  grunt.initConfig({
    shell: {
      build: {
        command: 'jekyll build'
      },
      server: {
        command: 'jekyll serve'
      },
      deploy: {
        command: 'git push prod master'
      }
    }
  });

  grunt.registerTask('deploy', ['shell:deploy']);
};