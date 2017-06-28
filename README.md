# DI-Proxy

Dependency Injection UMD Module using the Built-in Proxy.

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url] [![Standard][code-style-image]][code-style-url]

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

## Documentation

```js
/**
 * Returns dependency injection function
 * @function
 * @param {Function} resolver
 * @param {Boolean} [noCache = false]
 * @returns {Function} inject
 */
function createInjector(resolver[, noCache = false])
```

* `{Function} resolver` accepts a single argument `{String} propertyName` from a trapped property accessor and returns the dependency with that key.
*  `{Boolean} noCache` determines whether to disable memoization of the `resolver` and each `propertyName` resolved.
  Defaults to `false`.
*  `{Function} inject` accepts a single argument `callbackfn` and returns `{Function} injected` which invokes `callbackfn` with a `{Proxy} proxy` bound to the first argument.

```js
/**
 * Dependency-injected function
 * @callback
 * @param {Proxy} proxy
 */
function injected(proxy)
```

* `{Proxy} proxy` traps property accessors and invokes `resolver` each time with the `propertyName` accessed.
  If `noCache` is `false` or `undefined`, `proxy` will memoize each property accessor by defining a true property with the key `propertyName` and the value returned by `resolver`.

## Usage

```js
// pass dependency resolver to injector factory
const inject = createInjector(require)
// wrap IIFE with dependency injector
inject(({ http, express, 'socket.io': sio }) => {
  const app = express()
  const server = http.Server(app)
  const io = sio(server)
  // ...
})()
```

### Wait, what just happened?

`inject()` bound the function with a particular [`Proxy`][proxy] as the first argument, which trapped each property accessor and invoked `require()` to resolve each property name.

### Well, what else can it do?

I'm glad you asked. Here's some other interesting design patterns (using somewhat contrived examples) you can accomplish with this:

[`jQuery`][jquery-demo]:

```js
const $inject = window.createInjector(jQuery, true)

// IIFE
$inject(({
  'input#file-input': $file,
  'ul#preview-names': $previewNames
}) => {
  $file.change(() => {
    $previewNames.empty()
    const files = $file.prop('files')
    for (const file of files) {
      $previewNames.append($('<li/>').text(file.name))
    }
  })
})()
```

[`document.querySelector`][query-selector-demo]:

```js
const injectQS = window.createInjector(
  document.querySelector.bind(document),
  true
)

// get some properties and attributes of an <input>
injectQS(({ input: { id, name, type, value }, pre }) => {
  const formattedText = `id: ${id}
name: ${name}
type: ${type}
value: ${value}`
  pre.appendChild(document.createTextNode(formattedText))
})()
```

[`sessionStorage.getItem`][session-storage-demo]:

```js
const injectLS = window.createInjector(
  sessionStorage.getItem.bind(sessionStorage),
  true
)

sessionStorage.setItem('test', 'value')
sessionStorage.setItem('another', 'thing')

// get some session properties
injectLS(({ test, another }) => {
  const formattedText = `test: ${test}, another: ${another}`

  document.getElementById('out').textContent = formattedText
})()
```

## Dependencies and Supported Environments

This assumes that the environment it's running in has a working implementation for [`Proxy`][proxy] and [`WeakMap`][weakmap], which is used to reduce memory consumption of memoization.

This means that all modern browsers, including Microsoft Edge, and Node.js `>=6.0.0` are supported, according to [caniuse.com][caniuse] and [kangax/compat-table][compat-table].

## Some Notes on Performance

Internally this dependency injection uses [`Proxy`][proxy], which some may frown upon due to the overhead of invoking meta traps. However, I have taken note of this and wrote the library to balance convenience with performance by optionally [_memoizing_][memoize] each property accessor by default. Not sure what I mean? Here's an example:

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

[travis-url]: https://travis-ci.org/patrickroberts/di-proxy
[travis-image]: https://travis-ci.org/patrickroberts/di-proxy.svg?branch=master

[codecov-url]: https://codecov.io/gh/patrickroberts/di-proxy
[codecov-image]: https://codecov.io/gh/patrickroberts/di-proxy/branch/master/graph/badge.svg

[code-style-url]: https://standardjs.com/
[code-style-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[jquery-demo]: https://jsfiddle.net/patrob10114/zhdj6jgb/
[query-selector-demo]: https://jsfiddle.net/patrob10114/jbu5tm1j/
[session-storage-demo]: https://jsfiddle.net/patrob10114/3yb8a5u4/

[proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[memoize]: https://en.wikipedia.org/wiki/Memoization
[weakmap]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
[caniuse]: https://caniuse.com/#search=Proxy
[compat-table]: https://kangax.github.io/compat-table/es6/#test-Proxy
