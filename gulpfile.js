gulp = require('gulp');
dir = require('require-dir');

config = require('./config.json');

var knownOptions = {
    string: 'env',
    default: {env: process.env.NODE_ENV || 'dev'}
};
var minimist = require('minimist');

var options = minimist(process.argv.slice(2), knownOptions);

if (options['env'] === 'production') {
    config.isProduction = true;
    console.log('Production build')
}
modules = {};

onErrors = function (error) {
    console.log(error.toString());
};

var uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('default',  function () {

    return gulp.src(config['build']['src'])

        .pipe(concat(config['build']['dst']))
        .on('error', onErrors)

        .pipe(uglify())
        .on('error', onErrors)

        .pipe(gulp.dest('./'));
});

