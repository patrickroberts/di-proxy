module.exports = function createInjector (require) {
  if (typeof require !== 'function') {
    throw new TypeError(`${String(require)} is not a function`)
  }

  // weakly memoize injector with require function as key
  if (this.has(require)) return this.get(require)
  this.set(require, inject)

  function Injector () {}

  Injector.prototype = new Proxy({}, {
    get (target, propertyName, receiver) {
      const dependency = require(propertyName)

      // memoize get trap
      Object.defineProperty(receiver, propertyName, {
        configurable: true,
        enumerable: true,
        value: dependency,
        writable: true
      })

      return dependency
    }
  })

  // create a memoized get trap proxy
  const proxy = new Injector()

  // expect callback function to take dependency object as first argument
  function inject (callbackfn) {
    if (typeof callbackfn !== 'function') {
      throw new TypeError(`${String(callbackfn)} is not a function`)
    }

    return function () {
      return callbackfn.call(this, proxy, ...arguments)
    }
  }

  // return wrapped function
  return inject
}.bind(new WeakMap())
