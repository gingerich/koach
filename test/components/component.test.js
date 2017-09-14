import { Component } from '../../src'

describe('Component', () => {

  test('component.compose() is abstract', () => {
    const c = new Component()
    expect(() => {
      c.compose()
    }).toThrowError(/must implement compose()/)
  })

  test('component.config is an object', () => {
    const c = new Component({ a: 1, b: { test: true } })
    expect(c.config).toEqual(expect.objectContaining({ a: 1, b: { test: true } }))
  })

  test('component.config is a function', () => {
    const c = new Component({ a: 1, b: { test: true } })
    expect(c.config).toBeInstanceOf(Function)
    expect(c.config('a')).toBe(1)
    expect(c.config('b.test')).toBe(true)
    expect(c.config('c', 5)).toBe(5)
  })

  describe('component.use(...subcomponents)', () => {
    test('throws error if non function is given', () => {
      const c = new Component()
      expect(() => {
        c.use(new Component())
      }).toThrowError(/must be a function/)
    })

    test('is chainable', () => {
      const c = new Component()
      expect(c.use()).toBe(c)
    })

    test('adds middleware', () => {
      const c = new Component().use(() => {})
      expect(c.subcomponents).toHaveLength(1)
      c.use(() => {}, () => {})
      expect(c.subcomponents).toHaveLength(3)
    })
  })

  describe('Component.compose(config)', () => {
    test('produces composed function', () => {
      class MyComponent extends Component {
        compose () {
          return () => this.config
        }
      }

      const fn = MyComponent.compose({ test: true })
      expect(fn).toBeInstanceOf(Function)
      expect(fn()).toEqual(expect.objectContaining({ test: true }))
    })
  })

  describe('Component.spec()', () => {
    class MyComponent extends Component {}

    test('generates spec', () => {
      const spec = MyComponent.spec()
      expect(spec.make()).toBeInstanceOf(MyComponent)
    })

    test('generates spec with config', () => {
      const spec = MyComponent.spec({ test: true })
      const instance = spec.make()
      expect(instance.config).toEqual(expect.objectContaining({ test: true }))
    })

    test('generates spec with factory', () => {
      class Foo {}
      const spec = MyComponent.spec({}, () => new Foo())
      expect(spec.make()).toBeInstanceOf(Foo)
    })
  })

  describe('Component.Spec', () => {
    class MyComponent extends Component {}
    const MyComponentSpec = class Spec {}
    MyComponent.Spec = MyComponentSpec

    test('generates custom spec', () => {
      const spec = MyComponent.spec()
      expect(spec).toBeInstanceOf(MyComponentSpec)
    })
  })
})
