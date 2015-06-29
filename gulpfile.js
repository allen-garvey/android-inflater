"use strict";

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var maps = require('gulp-sourcemaps');

gulp.task('concatScripts', function(){
	return gulp.src(['js/android_inflater_util.js', 'js/app.js', 'js/java_declaration_parser.js', 'js/android_inflate_xml.js'])
		.pipe(maps.init())
		.pipe(concat('app.js'))
		.pipe(maps.write('./'))
		.pipe(gulp.dest('scripts'));
});

gulp.task('minifyScripts', ['concatScripts'], function(){
	return gulp.src('scripts/app.js')
		.pipe(uglify())
		.pipe(rename('app.min.js'))
		.pipe(gulp.dest('scripts'));
});
gulp.task('watchScripts', function(){
	gulp.watch('js/**/*.js', ['minifyScripts']);
});

gulp.task('build', ['minifyScripts']);
gulp.task('default', ['build']);
