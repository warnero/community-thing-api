var
    gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint'),
    exit = require('gulp-exit'),
    Q = require('q'),
    TestData = require("./test/utils/data");

gulp.task('setup-test-data', function(callback){
    TestData.createTestData(function(err){
        return callback(err);
    });
});

gulp.task('clear-test-data', function(callback){
    TestData.clearDatabase(function(err){
        return callback(err);
    });
});

gulp.task('start-test-server', function() {

    var conf = require("./config/settings");
    GLOBAL.server = "http://localhost:" + conf.get('port');
    var
        app = require(__dirname + '/./app');
});

gulp.task('run-tests',['start-test-server'], function() {
    return gulp.src(['test/specs/*.test.js'], { read: false })
        .pipe(mocha({
            reporter: 'spec',
            globals: {
                should: require('should')
            }
        }))
        .pipe(exit());
});

gulp.task('lint', function(done) {
  return gulp.src(['./lib/*.js', 'test/*.test.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('clean-populate', ['clear-test-data','setup-test-data']);
gulp.task('default', ['clean-populate', 'run-tests']);
