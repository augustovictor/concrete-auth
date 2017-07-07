// BUILD SYSTEM - Collection of tasks (task runners);

const gulp    = require('gulp');
const batch   = require('gulp-batch');
const mocha   = require('gulp-mocha');
const plumber = require('gulp-plumber');
const nodemon = require('gulp-nodemon');
const env     = require('gulp-env');
const jshint  = require('gulp-jshint');
const apidoc  = require('gulp-apidoc');

// TASKS
gulp.task('message', () => {
    console.log('Something changed!');
});

gulp.task('docs', done => {
    apidoc({
        src: 'src/',
        dest: 'docs/'
        // debug: true
    }, done);
});

gulp.task('hint', () => {
    return gulp.src('src/**/*.+(js|json)')
        .pipe(jshint())
        .pipe(jshint.reporter('default', {
            esversion: 6
        }));
});

gulp.task('runTests', () => {
    const envTest = env.set({ NODE_ENV: 'test' });
    return gulp.src('src/tests/**/*.test.js', { read: false })
        .pipe(envTest)
        .pipe(plumber())
        .pipe(mocha({ reporter: 'list' }))
        .on('error', (err) => {
            console.log(err.stack);
        });
});

gulp.task('start', () => {
    nodemon({
        script: 'src/app.js',
        ext: 'js json',
        env: {
            // 'NODE_ENV': 'development'
        }
    });
});

// WATCH
gulp.task('watch', () => {
    gulp.watch(['src/**/*.+(js|json)'], ['runTests']);
    gulp.watch(['src/**/*.+(js|json)'], ['docs']);
});

gulp.task('hint-watch', ['hint'], () => {
    gulp.watch('src/**/*.+(js|json)', ['hint']);
});

// DEFAULT
gulp.task('default', ['hint-watch', 'docs', 'runTests', 'watch']);