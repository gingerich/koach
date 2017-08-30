import request from 'supertest'

import ApplicationContext from '../../src/components/ApplicationContext'
import { Provider, Component } from '../../src'

describe('ApplicationContext', () => {
  describe('app.attach()', () => {
    test('adds instance property', () => {
      const app = new ApplicationContext()
      app.attach('foo', () => ({ test: true }))
      expect(app.foo).toEqual({ test: true })
    })

    test('property is read-only', () => {
      const app = new ApplicationContext()
      app.attach('foo', () => ({ test: true }))
      expect(() => {
        app.foo = {}
      }).toThrowError()
    })
  })

  describe('app.compose()', () => {
    let Koach

    beforeEach(() => {
      Koach = new Provider()
    })

    test('uses Stack to wraps subcomponents', async () => {
      class MyComponent extends Component {
        compose () {
          return ApplicationContext.spec()
            .use(async (ctx, next) => {
              await next()
              ctx.body.test = true
            })
            .use((ctx) => {
              ctx.body = { id: 123 }
            })
        }
      }

      Koach.registerComponent('App', () => MyComponent)
      const server = Koach.listen()

      await request(server)
        .get('/')
        .expect(200, {
          id: 123,
          test: true
        })
      server.close()
    })
  })

  describe('app.use()', () => {
    let Koach

    beforeEach(() => {
      Koach = new Provider()
    })

    test('allows decorating context instance', () => {
      class MyComponent extends Component {
        componentWillMount () {
          this.context.use(async (ctx, next) => {
            await next()
            ctx.body.test = true
          })
        }

        compose () {
          return ctx => ctx.body = {}
        }
      }

      class App extends Component {
        compose () {
          return ApplicationContext.spec()
            .use(MyComponent.spec())
        }
      }

      Koach.registerComponent('App', () => App)
      const server = Koach.listen()

      request(server)
        .get('/')
        .expect(200, {
          test: true
        })
        .end(() => server.close())
    })
  })
})
