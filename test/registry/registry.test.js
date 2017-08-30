import Registry from '../../src/lib/Registry'

describe('Registry', () => {

  test('registry.get(name)', () => {
    const registry = new Registry()
    registry.service('test', function () { return { test: true } })
    expect(registry.get('test')).toEqual({ test: true })
  })

  describe('config.strict', () => {
    afterEach(() => {
      Registry.config.strict = false
    })

    test('is true', () => {
      const registry = new Registry()
      registry.service('test', function () {}, 'foo')
      Registry.config.strict = true

      expect(() => {
        registry.get('test')
      }).toThrowError()
    })

    test('is false by default', () => {
      const registry = new Registry()
      registry.service('test', function () {}, 'foo')
      expect(() => {
        registry.get('test')
      }).not.toThrowError()
    })
  })

  test('wraps bottlejs methods', () => {
    const registry = new Registry()
    expect(registry.service).toBeInstanceOf(Function)
    expect(registry.factory).toBeInstanceOf(Function)
    expect(registry.provider).toBeInstanceOf(Function)
    expect(registry.decorator).toBeInstanceOf(Function)
    expect(registry.constant).toBeInstanceOf(Function)
    expect(registry.value).toBeInstanceOf(Function)
    expect(registry.middleware).toBeInstanceOf(Function)
  })
})
