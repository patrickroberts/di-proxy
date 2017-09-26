const { promisify } = require('util')
const fs = require('fs')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const gulp = require('gulp')
const jsdoc2md = require('jsdoc-to-markdown')

gulp.task('docs', () => {
  return readFile('gulp/template.hbs')
    .then(
      template => jsdoc2md.render({
        files: 'es6/index.js',
        template: template.toString('utf8')
      })
    )
    .then(out => writeFile('README.md', out))
})
