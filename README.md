# DI-Proxy

Dependency Injection UMD Module using the Built-in Proxy.

[![NPM Version][npm-image]][npm-url] [![Node Version][node-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Code Coverage][codecov-image]][codecov-url] [![devDependencies][devdep-image]][devdep-url] [![License][license-image]][license-url] [![Standard][style-image]][style-url] [![Github File Size][filesize-image]][filesize-url]

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

**HTML:**

```html
<script src="js/di-proxy.min.js"></script>
<script>
  var createInjector = window.createInjector
</script>
```

**Node.js & Express:**

```js
const directory = path.dirname(require.resolve('di-proxy'))
app.use('/js', express.static(directory))
```

## Documentation

```js
/**
 * @function
 * @description Returns dependency injection function
 * @param {Function} resolver
 * @param {Boolean} [noCache = false]
 * @returns {Function} inject
 */
function createInjector(resolver[, noCache = false])
```

* `{Function} resolver` accepts a single argument `{String} propertyName` from a trapped property accessor and returns the dependency with that key.
* `{Boolean} noCache` determines whether to disable memoization of the `resolver` and each `propertyName` resolved.
  Defaults to `false`.
* `{Function} inject` accepts a single argument `callbackfn` and returns `{Function} injected` which invokes `callbackfn` with a `{Proxy} proxy` bound to the first argument.

```js
/**
 * @callback
 * @description Dependency-injected function
 * @param {Proxy} proxy
 */
function injected(proxy)
```

* `{Proxy} proxy` traps property accessors and invokes `resolver` each time with the `propertyName` accessed.
  If `noCache` is `false` or `undefined`, `proxy` will memoize each property accessor by defining a property on itself with the key `propertyName` and the value returned by `resolver`.

## Usage

```js
// pass dependency resolver to injector factory
const inject = createInjector(require)
// wrap IIFE with dependency injector
inject(({ http, express, 'socket.io': sio }) => {
  const app = express()
  const server = http.Server(app)
  const io = sio(server)
  …
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
  const formattedText = `id: ${id}, name: ${name}, type: ${type}, value: ${value}`
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

This assumes that the environment has a working implementation for [`Proxy`][proxy] and [`WeakMap`][weakmap], which is used to reduce memory consumption of memoization.

All modern browsers including Microsoft Edge, and Node.js `>=6.0.0` are supported, according to [caniuse.com][caniuse] and [kangax/compat-table][compat-table].

## Some Notes on Performance

Internally this dependency injection uses [`Proxy`][proxy], which some may frown upon due to the overhead of invoking meta traps. However, this has been mitigated by optionally [_memoizing_][memoize] each property accessor by default. Not sure what I mean? Here's an example:

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

You should be careful when using the default behavior in coordination with a query function for live data (like `jQuery`, for example), as it will memoize the injector with the result of the first call for each property name unless you `delete` it from the `proxy` object before each subsequent call, or set the optional `noCache` parameter to `true` when calling `createInjector()`.

This library allows you to re-use a created injector without taking a performance hit from the overhead of a naive proxy implementation when injecting the same dependency repeatedly, even across multiple functions wrapped by the same injector. Alternatively, if you need each property accessor to re-evaluate live data in the case that your dependencies are mutable, you have that option as well on a case-by-case basis.

## License

Available under the MIT License
(c) 2017 Patrick Roberts

[npm-url]: https://www.npmjs.com/package/di-proxy
[npm-image]: https://img.shields.io/npm/v/di-proxy.svg

[node-image]: https://img.shields.io/node/v/di-proxy.svg

[travis-url]: https://travis-ci.org/patrickroberts/di-proxy
[travis-image]: https://travis-ci.org/patrickroberts/di-proxy.svg?branch=master

[codecov-url]: https://codecov.io/gh/patrickroberts/di-proxy
[codecov-image]: https://codecov.io/gh/patrickroberts/di-proxy/branch/master/graph/badge.svg

[devdep-url]: https://github.com/patrickroberts/di-proxy/blob/master/package.json#L32-L48
[devdep-image]: https://img.shields.io/david/dev/patrickroberts/di-proxy.svg

[license-url]: https://github.com/patrickroberts/di-proxy/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg

[style-url]: https://standardjs.com/
[style-image]: https://img.shields.io/badge/style-standard-brightgreen.svg

[filesize-url]: https://github.com/patrickroberts/di-proxy/blob/master/umd/di-proxy.min.js
[filesize-image]: https://img.shields.io/github/size/patrickroberts/di-proxy/umd/di-proxy.min.js.svg

[jquery-demo]: https://jsfiddle.net/patrob10114/zhdj6jgb/
[query-selector-demo]: https://jsfiddle.net/patrob10114/jbu5tm1j/
[session-storage-demo]: https://jsfiddle.net/patrob10114/3yb8a5u4/

[proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[memoize]: https://en.wikipedia.org/wiki/Memoization
[weakmap]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
[caniuse]: https://caniuse.com/#search=Proxy
[compat-table]: https://kangax.github.io/compat-table/es6/#test-Proxy
