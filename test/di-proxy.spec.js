/* eslint-env mocha */
const { expect } = require('chai')
const createInjector = require('../es6')

describe('di-proxy', () => {
  describe('createInjector()', () => {
    it('should throw if argument is not a function', () => {
      expect(() => createInjector()).to.throw(TypeError, 'is not a function')
    })

    it('should return a function', () => {
      expect(createInjector(() => {})).to.be.a('function')
    })

    it('should return a function that will throw if its argument is not a function', () => {
      const inject = createInjector(() => {})

      expect(() => inject()).to.throw(TypeError, 'is not a function')
    })

    it('should return a function that will return a function', () => {
      expect(createInjector(() => {})(() => {})).to.be.a('function')
    })

    it('should call function parameter in the get trap', () => {
      let called = false
      const fakeRequire = (propertyName) => (called = true)
      const inject = createInjector(fakeRequire)

      expect(called).to.equal(false)

      inject(({ invokeTrap }) => {})()

      expect(called).to.equal(true)
    })

    it('should resolve get trap with return value from function parameter', () => {
      const fakeRequire = (propertyName) => propertyName

      createInjector(fakeRequire)(({ prop }) => {
        expect(prop).to.equal('prop')
      })
    })

    it('should memoize injectors with function parameter as key', () => {
      const fakeRequire = () => {}

      expect(createInjector(fakeRequire)).to.equal(createInjector(fakeRequire))
    })

    it('should memoize resolved dependencies per require function with property name as key', () => {
      let timesCalled = 0
      const fakeRequire1 = () => ++timesCalled
      const fakeRequire2 = () => ++timesCalled
      const inject1 = createInjector(fakeRequire1)
      const inject2 = createInjector(fakeRequire2)

      inject1((proxy1) => {
        expect(proxy1.prop1).to.equal(1)
        expect(proxy1.prop2).to.equal(2)
        // repeat to ensure proxy objects resolve repeated
        // property accesses without invoking get trap
        expect(proxy1.prop1).to.equal(1)
      })()

      inject2((proxy2) => {
        expect(proxy2.prop1).to.equal(3)
        expect(proxy2.prop2).to.equal(4)
        // repeat to ensure proxy objects resolve repeated
        // property accesses without invoking get trap
        expect(proxy2.prop1).to.equal(3)
      })()

      // repeat to ensure injectors resolve repeated
      // property accesses without invoking get trap

      inject1((proxy1) => {
        expect(proxy1.prop1).to.equal(1)
        expect(proxy1.prop2).to.equal(2)
      })()

      inject2((proxy2) => {
        expect(proxy2.prop1).to.equal(3)
        expect(proxy2.prop2).to.equal(4)
      })()

      // make sure get trap was not invoked more than once
      // per unique property access per require function
      expect(timesCalled).to.equal(4)
    })
  })
})
