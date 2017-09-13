import get from 'lodash.get'
import request from 'supertest'

import Koach from '../../src'
import Component from '../../src/components/Component'
import Module from '../../src/components/Module'

describe('Module', () => {
  const mockContents = {
    controllers: {
      TestController: class TestController extends Component {
        compose () {
          return ctx => ctx.body = { test: !!this.config.test }
        }
      }
    },
    middleware: {
      TestMiddleware: class TestMiddleware extends Component {
        compose () {
          return (ctx, next) => {
            return next().then(() => {
              ctx.body.foo = this.config.foo
            })
          }
        }
      }
    }
  }
  Module.Loader.loadDir = jest.fn()
    .mockReturnValue(Object.assign(get.bind(null, mockContents), mockContents))

  describe ('config.routes', () => {
    test('loads module contents', () => {
      const m = new Module({
        routes: [{
          name: 'controllers.TestController',
          path: '/test',
          method: 'GET',
          config: { test: true }
        }],
        subcomponents: []
      })

      const router = m.compose()
      expect(router.subcomponents).toHaveLength(1)
    })

    test('should route requests', () => {
      const m = Module.spec({
        routes: [{
          name: 'controllers.TestController',
          path: '/test',
          method: 'GET',
          config: { test: true },
          middleware: [{
            name: 'middleware.TestMiddleware',
            config: { foo: 'bar' }
          }]
        }]
      })
      const server = new Koach.Provider().createServer()
      server.use(m.compose())
      return request(server.listen())
        .get('/test')
        .expect(200, { test: true, foo: 'bar' })
        .then(() => server.disconnect())
    })
  })

  describe('config.loader', () => {
    test('empty loader has no effect', () => {
      const m = Module.spec({ loader: new Module.Loader() })
      const server = new Koach.Provider().createServer()
      server.use(m.compose())
      return request(server.listen())
        .get('/test')
        .expect(404)
        .then(() => server.disconnect())
    })
  })
})
