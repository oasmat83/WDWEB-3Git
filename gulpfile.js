var gulp = require('gulp'),
browserSync = require('browser-sync').create(),
modRewrite = require('connect-modrewrite');
var gulp = require('gulp');
var sass = require('gulp-sass');  
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var cleanCSS = require('gulp-clean-css');

// var jsFiles = ['./public/WDWEB/components/**/*.js', './public/WDWEB/shared/**/*.js'];
var jsFiles = ['./public/WDWEB/components/**/*.js', '!./public/WDWEB/components/**/*.min.js', './public/WDWEB/shared/**/*.js', '!./public/WDWEB/shared/**/*.min.js'];
var jsDest = './public/WDWEB/components/home/mini';

gulp.task('connect', function() {
    browserSync.init({
        files: ["./**/*.*"],
        port: 7856,
        ui: {
            port: 7856
        },
        server: {
            baseDir: "./public",
            middleware: [
                modRewrite(['^([^.]+)$ /index.html [L]'])
            ]
        },
        https: {
            key: "public/WDWEB/key.pem",
            cert: "public/WDWEB/cert.pem"
        }
    });
});

gulp.task('sass', function () {
    return gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./public/WDWEB/css'));
});
   
gulp.task('sass:watch', function () {
    gulp.watch('./sass/*.scss', ['sass']);
    // gulp.watch(jsFiles, ['scripts']);
});

gulp.task('scripts', function() {
    return gulp.src(jsFiles, {base: "./"})

    .pipe(rename(function(path) {
        path.basename = path.basename + ".min";
    }))   
    .pipe(uglify())
    // .pipe(concat())
    .pipe(gulp.dest('.'));
});

gulp.task('serve', ['connect']);