// expect callback function to take dependency object as first argument
function injector (callbackfn) {
  if (typeof callbackfn !== 'function') {
    throw new TypeError(`${String(callbackfn)} is not a function`)
  }

  const proxy = this

  return function () {
    return callbackfn.call(this, proxy, ...arguments)
  }
}

module.exports = function createInjector (require, noCache = false) {
  if (typeof require !== 'function') {
    throw new TypeError(`${String(require)} is not a function`)
  }

  // if require function is weakly referenced and memoization is enabled
  if (!noCache && this.has(require)) {
    // return cached injector
    return this.get(require)
  }

  const inject = injector.bind(
    Object.setPrototypeOf({}, new Proxy(require, {
      get (target, propertyName, receiver) {
        const dependency = target(propertyName)

        if (!noCache) {
          // memoize get trap
          Object.defineProperty(receiver, propertyName, {
            configurable: true,
            enumerable: true,
            value: dependency,
            writable: true
          })
        }

        return dependency
      }
    }))
  )

  // weakly reference injector with require function as key
  this.set(require, inject)

  // return wrapped function
  return inject
}.bind(new WeakMap())
