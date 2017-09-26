/* eslint-env mocha */
const { expect } = require('chai')
const { inject, wrap } = require('../es6')

describe('di-proxy', () => {
  describe('inject(resolver)', () => {
    it('throws if resolver is not a function', () => {
      expect(() => inject()).to.throw(TypeError, 'is not a function')
    })

    it('returns an object', () => {
      expect(inject(() => {})).to.be.an('object')
    })

    it('invokes resolver from get trap', () => {
      /* eslint no-unused-expressions: off */

      let called = false

      const fakeResolver = () => { called = true }
      const proxy = inject(fakeResolver)

      expect(called).to.equal(false)

      proxy.somePropertyName

      expect(called).to.equal(true)
    })

    it('returns result of invoking resolver from get trap', () => {
      const fakeResolver = (propertyName) => propertyName

      let key = String(Math.random())

      expect(inject(fakeResolver)[key]).to.equal(key)
    })
  })

  describe('inject(..., memoize = true)', () => {
    it('memoizes property accesses per resolver', () => {
      let timesCalled = 0

      const fakeResolver = () => ++timesCalled

      // default behavior memoizes
      const proxy = inject(fakeResolver)

      expect(proxy.prop1).to.equal(1)
      expect(proxy.prop2).to.equal(2)
      // repeat to ensure proxy resolves repeated
      // property accesses without invoking get trap
      expect(proxy.prop1).to.equal(1)

      // make sure get trap was not invoked more
      // than once per unique property access
      expect(timesCalled).to.equal(2)
    })
  })

  describe('inject(..., memoize = false)', () => {
    it('does not memoize property accesses', () => {
      let timesCalled = 0

      const fakeResolver = () => ++timesCalled

      const proxy = inject(fakeResolver, false)

      expect(proxy.prop1).to.equal(1)
      expect(proxy.prop2).to.equal(2)
      // repeat to ensure proxy resolves repeated
      // property accesses by invoking get trap
      expect(proxy.prop1).to.equal(3)

      // make sure get trap was invoked more
      // than once per unique property access
      expect(timesCalled).to.equal(3)
    })
  })

  describe('wrap()', () => {
    it('throws if resolver is not a function', () => {
      expect(() => wrap()).to.throw(TypeError, 'is not a function')
    })

    it('throws if callback is not a function', () => {
      expect(() => wrap(() => {})).to.throw(TypeError, 'is not a function')
    })

    it('returns a function', () => {
      expect(wrap(() => {}, () => {})).to.be.a('function')
    })

    it('invokes callback from returned function', () => {
      let called = false

      const fakeCallback = () => { called = true }
      const injector = wrap(() => {}, fakeCallback)

      expect(called).to.equal(false)

      injector()

      expect(called).to.equal(true)
    })

    it('invokes resolver if property of first argument in callback is accessed', () => {
      let called = false

      const fakeResolver = () => { called = true }
      const fakeCallback = (proxy) => {
        /* eslint no-unused-expressions: off */
        proxy.somePropertyName
      }

      const injector = wrap(fakeResolver, fakeCallback)

      expect(called).to.equal(false)

      injector()

      expect(called).to.equal(true)
    })

    it('passes parameters to callback after the first argument', () => {
      const params = [{}, {}, {}]

      function fakeCallback (proxy, ...args) {
        args.forEach((arg, index) => expect(arg).to.equal(params[index]))
      }

      const injector = wrap(() => {}, fakeCallback)

      injector(...params)
    })
  })
})
