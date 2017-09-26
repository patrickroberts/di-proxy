# DI-Proxy

Dependency Injection UMD Module using the Built-in Proxy.

[![NPM Version][npm-image]][npm-url] [![Node Version][node-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Code Coverage][codecov-image]][codecov-url] [![devDependencies][devdep-image]][devdep-url] [![License][license-image]][license-url] [![Standard][style-image]][style-url] [![Github File Size][filesize-image]][filesize-url]

## Installation

```bash
$ npm i --save di-proxy
```

## How to include in...

### ES6 import (with babel):

```js
import { inject, wrap } from 'di-proxy'
```

### CommonJS:

```js
const { inject, wrap } = require('di-proxy')
```

### Browser:

```html
<script src="https://unpkg.com/di-proxy"></script>
<script>
  const { inject, wrap } = window.diProxy
</script>
```

<a name="inject"></a>

## inject(resolver, [memoize]) ⇒ [<code>Proxy</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
Creates an optionally memoized proxy that invokes the resolver from trapped property accesses.

**Kind**: global function
**Returns**: [<code>Proxy</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) - proxy - A proxy with a get trap that invokes the resolver.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| resolver | [<code>resolver</code>](#resolver) |  | A function invoked within the get trap of returned proxy. |
| [memoize] | <code>boolean</code> | <code>true</code> | Shadow properties with result from first invocation of resolver. |

<a name="wrap"></a>

## wrap(resolver, callback) ⇒ [<code>injector</code>](#injector)
**Kind**: global function
**Returns**: [<code>injector</code>](#injector) - injector - A function that passes arguments after the proxy in callback when invoked.

| Param | Type | Description |
| --- | --- | --- |
| resolver | [<code>resolver</code>](#resolver) | A function invoked within the get trap of first argument to callback. |
| callback | [<code>callback</code>](#callback) | A function that accepts a proxy as the first argument. |

<a name="resolver"></a>

## resolver ⇒ <code>\*</code>
**Kind**: global typedef
**Returns**: <code>\*</code> - result - Synchronously resolved object referenced by key.
**See**: [`inject()`](#inject)

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | A reference to some sort of dependency or query. |

<a name="callback"></a>

## callback ⇒ <code>\*</code>
**Kind**: global typedef
**See**: [`wrap()`](#wrap)

| Param | Type | Description |
| --- | --- | --- |
| proxy | [<code>Proxy</code>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) | Bound parameter which is the result of `inject(resolver, true)`. |
| ...rest | <code>\*</code> | Arguments passed when invoking injector. |

<a name="injector"></a>

## injector ⇒ <code>\*</code>
**Kind**: global typedef
**Returns**: <code>\*</code> - result - Result of invoking callback.
**See**: [`wrap()`](#wrap)

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>\*</code> | Passed as rest parameter to callback. |


## Usage

```js
const { http, express, 'socket.io': sio } = inject(require)

const app = express()
const server = http.Server(app)
const io = sio(server)
// ...
```

### Other examples

[`jQuery`][jquery-demo]:

```js
const {
  'input#file-input': $file,
  'ul#preview-names': $previewNames
} = diProxy.inject(jQuery)

$file.change(() => {
  $previewNames.empty()

  const files = $file.prop('files')

  for (const file of files) {
    $previewNames.append($('<li/>').text(file.name))
  }
})
```

[`document.querySelector`][query-selector-demo]:

```js
const qs = diProxy.wrap(
  document.querySelector.bind(document),
  ({ input: { id, name, type, value }, pre }) => {
    const json = JSON.stringify({ id, name, type, value })

    pre.appendChild(document.createTextNode(json))
  }
)

qs()
```

[`sessionStorage.getItem`][session-storage-demo]:

```js
const ssdi = diProxy.inject(sessionStorage.getItem.bind(sessionStorage))

sessionStorage.setItem('test', 'value')
sessionStorage.setItem('another', 'thing')

// get some session properties
let { test, another } = ssdi

const formattedText = `test: ${test}, another: ${another}`
document.getElementById('out').textContent = formattedText
```

## Dependencies and Supported Environments

This assumes that the environment has a working implementation for [`Proxy`][proxy].

All modern browsers including Microsoft Edge, and Node.js `>=6.0.0` are supported, according to [caniuse.com][caniuse] and [kangax/compat-table][compat-table].

## Some Notes on Performance

Internally this dependency injection uses [`Proxy`][proxy]. However, any performance implications have been mitigated by optionally [_memoizing_][memoiziation] each property accessor by default:

```js
const string = diProxy.inject((prop) => {
  console.log('get trap invoked!')
  return prop
})

const value = string.somePropertyName // 'get trap invoked!'
console.log(value) // 'somePropertyName'
string.somePropertyName // nothing will be printed here
delete string.somePropertyName
string.somePropertyName // 'get trap invoked!'
```

You should be careful when using the default behavior in coordination with a query function for live data (like `jQuery`, for example), as it will memoize the resolver with the result of the first call for each property name unless you `delete` it from the `proxy` object before each subsequent call, or set the optional `memoize` parameter to `false` when calling `inject()`.

This library allows you to re-use a created proxy or injector without taking a performance hit from the overhead of a naive proxy implementation.

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

[devdep-url]: https://github.com/patrickroberts/di-proxy/blob/master/package.json#L32-L49
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
[memoization]: https://en.wikipedia.org/wiki/Memoization
[caniuse]: https://caniuse.com/#search=Proxy
[compat-table]: https://kangax.github.io/compat-table/es6/#test-Proxy
