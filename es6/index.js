/**
 * @external Proxy
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy|Proxy}
 */

/**
 * Creates an optionally memoized proxy that invokes the resolver from trapped property accesses.
 *
 * @function inject
 *
 * @param {resolver} resolver - A function invoked within the get trap of returned proxy.
 * @param {boolean} [memoize=true] - Shadow properties with result from first invocation of resolver.
 *
 * @return {external:Proxy} proxy - A proxy with a get trap that invokes the resolver.
 */
const inject = exports.inject = function inject (resolver, memoize = true) {
  if (typeof resolver !== 'function') {
    throw new TypeError(`${String(resolver)} is not a function`)
  }

  return Object.create(
    new Proxy(resolver, {
      get (target, key, receiver) {
        const value = target(key)

        if (memoize) {
          Object.defineProperty(receiver, key, { configurable: true, enumerable: true, value })
        }

        return value
      }
    })
  )
}

/**
 * @see {@link #inject|`inject()`}
 *
 * @callback resolver
 *
 * @param {string} key - A reference to some sort of dependency or query.
 *
 * @return {*} result - Synchronously resolved object referenced by key.
 */

/**
 * @function wrap
 *
 * @param {resolver} resolver - A function invoked within the get trap of first argument to callback.
 * @param {callback} callback - A function that accepts a proxy as the first argument.
 *
 * @return {injector} injector - A function that passes arguments after the proxy in callback when invoked.
 */
exports.wrap = function wrap (resolver, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError(`${String(callback)} is not a function`)
  }

  const proxy = inject(resolver)

  return function injector () {
    return callback.call(this, proxy, ...arguments)
  }
}

/**
 * @see {@link #wrap|`wrap()`}
 *
 * @callback callback
 *
 * @param {external:Proxy} proxy - Bound parameter which is the result of `inject(resolver, true)`.
 * @param {...*} rest - Arguments passed when invoking injector.
 *
 * @return {*}
 */

/**
 * @see {@link #wrap|`wrap()`}
 *
 * @callback injector
 *
 * @param {...*} args - Passed as rest parameter to callback.
 *
 * @return {*} result - Result of invoking callback.
 */
