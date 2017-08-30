import Spec from '../../src/lib/Spec'

describe('spec.make', () => {
  class Foo {}

  test('make instance from constructor', () => {
    const spec = new Spec(Foo)
    const instance = spec.make()
    expect(instance).toBeInstanceOf(Foo)
  })

  test('make instance from factory function', () => {
    const spec = new Spec(() => {
      return new Foo()
    })
    const instance = spec.make()
    expect(instance).toBeInstanceOf(Foo)
  })

  describe('spec.make(context)', () => {
    class Context { get id() { return 0 } }
    function Foo(config, context) { this.context = context }

    test('make instance with context', () => {
      const spec = new Spec(Foo)
      const instance = spec.make(new Context())
      expect(instance.context).toBeInstanceOf(Context)
      expect(instance.context.id).toBe(0)
    })
  })
})

describe('spec.config', () => {
  const Foo = jest.fn()

  test('make instance with empty config', () => {
    const instance = new Spec(Foo).make({})
    expect(Foo).toHaveBeenLastCalledWith({ subcomponents: [] }, {})
  })

  test('make instance with config', () => {
    const spec = new Spec(Foo, { test: true })
    const instance = spec.make({})
    expect(Foo).toHaveBeenLastCalledWith(expect.objectContaining({ test: true }), {})
  })
})

describe('spec.subcomponents', () => {
  function Foo(config) { this.config = config }

  test('make instance with subcomponents', () => {
    const subcomponents = [new Spec(), () => {}]
    const spec = new Spec(Foo, {}, subcomponents)
    const instance = spec.make()
    expect(instance.config.subcomponents).toBeInstanceOf(Array)
    subcomponents.pop()
    expect(instance.config.subcomponents).toHaveLength(2)
  })

  describe('spec.use()', () => {
    test('is chainable', () => {
      const spec = new Spec(Foo)
      expect(spec.use()).toBe(spec)
    })

    test('accepts path', () => {
      const spec = new Spec(Foo)
      spec.use('/path', new Spec(Foo), () => {})
      expect(spec.subcomponents).toHaveLength(1)
      expect(spec.subcomponents[0].subcomponents).toHaveLength(2)
    })

    test('accepts an array', () => {
      const spec = new Spec(Foo).use([new Spec(), () => {}])
      expect(spec.subcomponents).toHaveLength(2)
    })

    test('accepts a path and array', () => {
      const spec = new Spec(Foo).use('/path', [new Spec(), () => {}])
      expect(spec.subcomponents).toHaveLength(1)
      expect(spec.subcomponents[0].subcomponents).toHaveLength(2)
    })

    test('adds a subcomponent', () => {
      const spec = new Spec(Foo)
      expect(spec.subcomponents).toBeInstanceOf(Array)
      expect(spec.subcomponents).toHaveLength(0)

      spec.use(new Spec())
      expect(spec.subcomponents).toHaveLength(1)

      spec.use(() => {}, new Spec())
      expect(spec.subcomponents).toHaveLength(3)
    })
  })
})

describe('spec.ref', () => {
  class Foo {}

  test('ref callback', () => {
    const refCb = jest.fn()
    const spec = new Spec(Foo).ref(refCb)
    const instance = spec.make()
    expect(refCb).toHaveBeenCalledWith(instance)
  })
})

describe('spec.path', () => {
  test('configure spec path', () => {
    const spec = new Spec().path('/path')
    expect(spec.config).toHaveProperty('path', '/path')
  })
})

// describe('spec.except', () => {
//   test('configure spec except', () => {
//     const spec = new Spec().except({ method: 'POST' })
//     expect(spec.config).toHaveProperty('except', { method: 'POST' })
//   })
// })
