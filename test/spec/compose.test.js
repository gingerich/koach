import Koa from 'koa'
import compose from 'koa-compose'
import request from 'supertest'

import Component from '../../src/components/Component'
import Spec from '../../src/lib/Spec'

describe('Spec.compose(spec)', () => {
  const noop = () => {}
  let BaseComponent

  beforeEach(() => {
    BaseComponent = class extends Component {
      compose () { return noop }
    }
  })

  test('produces composed function', () => {
    const spec = BaseComponent.spec()
    const composed = Spec.compose(spec)
    expect(composed).toBe(noop)
  })

  describe('root component', () => {
    test('has undefined context', () => {
      let componentInstance
      Spec.compose(BaseComponent.spec({}).ref(instance => componentInstance = instance))
      expect(componentInstance.context).not.toBeDefined()
    })

    test('is the global context', () => {
      let rootComponent, subComponent
      class Foo extends Component {
        compose (middleware) { return compose(middleware()) }
      }
      const spec = Foo.spec()
        .ref(instance => rootComponent = instance)
        .use(
          BaseComponent.spec().ref(instance => subComponent = instance)
        )
      Spec.compose(spec)
      // expect(subComponent.context).toBe(rootComponent)
    })
  })

  // test('context is root component instance', () => {
  //   expect(instance.context).toBe(instance)
  // })

  describe('spec of non-component type', () => {
    test('throws an error', () => {
      class NotAComponent {}
      const spec = new Spec(NotAComponent)
      const compose = () => Spec.compose(spec)
      expect(compose).toThrow(TypeError)
    })
  })

  describe('component.componentWillMount(defer)', () => {
    test('is called once', () => {
      BaseComponent.prototype.componentWillMount = jest.fn()
      Spec.compose(BaseComponent.spec())
      expect(BaseComponent.prototype.componentWillMount).toHaveBeenCalledTimes(1)
    })

    test('is called before componentDidMount', () => {
      const componentWillMount = jest.fn()
      const componentDidMount = jest.fn()
      class MyComponent extends BaseComponent {
        componentWillMount () {
          componentWillMount()
          expect(componentDidMount).not.toHaveBeenCalled()
        }

        componentDidMount () {
          componentDidMount()
          expect(componentWillMount).toHaveBeenCalledTimes(1)
        }
      }
      Spec.compose(MyComponent.spec())
    })
  })

  describe('component.componentDidMount(parent)', () => {
    test('is passed a parent component instance', () => {
      class MyComponent extends BaseComponent {
        compose (middleware) {
          return compose(middleware())
        }
      }
      MyComponent.prototype.componentDidMount = jest.fn()

      let parentInstance
      const spec = MyComponent.spec()
        .ref(instance => parentInstance = instance)
        .use(MyComponent.spec())
      Spec.compose(spec)
      expect(MyComponent.prototype.componentDidMount).toHaveBeenCalledWith(parentInstance)
    })
  })

  describe('Component.of(fn)', () => {
    test('create Component instance from function', () => {
      const fn = () => {}
      const c = Component.of(fn)
      expect(c).toBeInstanceOf(Component)
      expect(c.compose()).toBe(fn)
    })
  })

  describe('Component.functional(fn)', () => {
    const FunctionalComponent = Component.functional((config) => () => config.foo)
    const fn = FunctionalComponent.compose({ foo: 123 })
    expect(fn()).toBe(123)
  })
})

describe('spec.compose()', () => {
  class Foo extends Component {
    compose (middleware) { return compose(middleware()) }
  }

  test('supports conventional middleware use', () => {
    const spec = new Spec(Foo)
      .use(ctx => ctx.body = { test: false })
      .use(ctx => ctx.body.test = true)

    const fn = spec.compose()
    expect(fn).toBeInstanceOf(Function)

    const koa = new Koa()
    koa.use(fn)

    const server = koa.listen()
    request(server)
      .get('/path')
      .expect(200, { test: true })
      .end(() => server.close())
  })
})
