# DI-Proxy

Dependency Injection UMD Module using the Built-in Proxy.

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url]

## Installation

```bash
$ npm i --save di-proxy
```

## How to include in...

### CommonJS:

```js
const createInjector = require('di-proxy')
```

### Browser:

```html
<script src="js/di-proxy.min.js"></script>
<script>
  var createInjector = window.createInjector
</script>
```

## Usage

```js
// pass dependency resolver to injector factory
const inject = createInjector(require)
// wrap function with dependency injector
const myFunctionWithInjectedDeps = inject(function (deps, config) {
  const { http, express, 'socket-io': sio } = deps
  const app = express()
  const server = http.Server(app)
  const io = sio(server)
  // ...
})
// execute function and pass other parameters here
myFunctionWithInjectedDeps(require('./config.json'))
```

### Wait, what just happened?

`inject()` bound the function with a particular [`Proxy`][proxy] as the first argument, which trapped each property accessor and invoked `require()` to resolve each property name.

### Well, what else can it do?

I'm glad you asked. Here's some other interesting design patterns (using somewhat contrived examples) you can accomplish with this:

`jQuery`:

```js
const $inject = createInjector(jQuery)

// IIFE
$inject(({
  'input#file-input': $file,
  'ul#preview-names': $previewNames
}) => {
  $previewNames.empty()
  const files = $file.prop('files')
  for (const file of files) {
    $previewNames.append(`<li>${file.name}</li>`)
  }
})()
```

`fs.readFileSync`:

```js
const injectRead = createInjector((path) => {
  return fs.readFileSync(__dirname + '/' + path)
})

injectRead(({
  'some-file.txt': someFile,
  'another-file.md': anotherFile
}) => {
  console.log(someFile.toString('utf8'))
  console.log(anotherFile.toString('utf8'))
})()
```

`document.querySelector`:

```js
const injectQS = createInjector(
  document.querySelector.bind(document)
)

// get some properties and attributes of an <input>
injectQS(function ({ input: { name, type, value } }) => {
  console.log(name, type, value)
})()
```

`async / await`:

```js
const injectBlobPromises = createInjector(async function (prop) {
  let response = await fetch(prop)
  let blob = await response.blob()
  return URL.createObjectURL(blob)
})

injectBlobPromises(async function (getBlobURLs, ...urls) {
  let blobURLs = await Promise.all(
    urls.map((url) => getBlobURLs[url])
  )
  console.log(blobURLs)
})('some.pdf', 'urls.jpg')
```

## Dependencies and Supported Environments

This assumes that the environment it's running in has a working implementation for [`Proxy`][proxy] and [`WeakMap`][weakmap]. The latter of the two is used to reduce memory consumption of memoization.

This means that all modern browsers, including Microsoft Edge, and Node.js `>= 6.0.0` are supported, according to [caniuse.com][caniuse] and [kangax/compat-table][compat-table].

## Some Notes on Performance

Internally this dependency injection uses [`Proxy`][proxy], which some may frown upon due to the overhead of invoking meta traps. However, I have taken note of this and wrote the library to balance convenience with performance by [_memoizing_][memoize] each property accessor. Not sure what I mean? Here's an example:

```js
const stringInject = createInjector((prop) => {
  console.log('get trap invoked!')
  return prop
})

stringInject((proxy) => {
  const value = proxy.somePropertyName // 'get trap invoked!'
  console.log(value) // 'somePropertyName'
  proxy.somePropertyName // nothing will be printed here
  delete proxy.somePropertyName
  proxy.somePropertyName // 'get trap invoked!'
})()

stringInject((proxy) => {
  proxy.somePropertyName // nothing will be printed here either
})()
```

Because of this, you should be careful when using this in coordination with a query function for live data (like `jQuery`, for example), as it will memoize the injector with the result of the first call unless you `delete` the property name from the `proxy` object before each subsequent call. In a future update, I will probably add an optional argument to disable memoization per injector function once I figure out how best to do that.

On the bright side, this means that you can re-use a created injector and be sure that you won't take a performance hit when injecting the same dependency repeatedly, even across multiple functions wrapped by the same injector.

## License

Available under the MIT License
(c) 2017 Patrick Roberts

[npm-url]: https://www.npmjs.com/package/di-proxy
[npm-image]: https://img.shields.io/npm/v/di-proxy.svg

[travis-url]: https://travis-ci.org/gulpjs/di-proxy
[travis-image]: https://travis-ci.org/patrickroberts/di-proxy.svg?branch=master

[codecov-url]: https://codecov.io/gh/patrickroberts/di-proxy
[codecov-image]: https://codecov.io/gh/patrickroberts/di-proxy/branch/master/graph/badge.svg

[proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[memoize]: https://en.wikipedia.org/wiki/Memoization
[weakmap]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
[caniuse]: https://caniuse.com/#search=Proxy
[compat-table]: https://kangax.github.io/compat-table/es6/#test-Proxy
