const gulp = require('gulp')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const gutil = require('gulp-util')

const config = require('../config')

gulp.task('babel', function () {
  return gulp.src(config.paths.lib.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015'],
      plugins: [
        'transform-es2015-modules-umd',
        ['rename-umd-globals', {
          index: config.names.glob
        }]
      ]
    }))
    .pipe(concat(config.names.lib))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .on('error', gutil.log)
    .pipe(gulp.dest(config.paths.lib.dst))
})
