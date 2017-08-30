import request from 'supertest'
import { Provider, Controller, Component } from '../../src'

describe('Controller', () => {
  let Koach = new Provider()

  afterEach(() => {
    Koach = new Provider()
  })

  test('empty controller', () => {
    Koach.registerComponent('App', () => Controller)
    const server = Koach.listen()

    request(server)
      .get('/')
      .expect(404)
      .end(() => server.close())
  })

  test('path prefix', async () => {
    class MyController extends Controller {
      get (ctx) {
        ctx.body = 'get'
      }
    }

    Koach.registerComponent('App', () => MyController)
    Koach.config({ path: '/prefix' })
    const server = Koach.listen()

    await request(server)
      .get('/')
      .expect(404)

    await request(server)
      .get('/prefix')
      .expect(200, 'get')

    server.close()
  })

  test('method bindings', () => {
    class MyController extends Controller {
      test () {
        return 'test'
      }

      get (ctx) {
        ctx.body = this.test()
      }
    }

    Koach.registerComponent('App', () => MyController)
    const server = Koach.listen()

    return request(server)
      .get('/')
      .expect(200, 'test')
      .then(() => server.close())
  })

  describe('HTTP methods', () => {
    class MyController extends Controller {
      get (ctx) { ctx.body = 'get' }
      post (ctx) { ctx.body = 'post' }
      put (ctx) { ctx.body = 'put' }
      patch (ctx) { ctx.body = 'patch' }
      delete (ctx) { ctx.body = 'delete' }
      options (ctx) { ctx.body = 'options' }
    }

    Koach.registerComponent('App', () => MyController)
    const server = Koach.listen()

    afterAll(() => {
      server.close()
    })

    test('get', () => request(server).get('/').expect(200, 'get'))
    test('post', () => request(server).post('/').expect(200, 'post'))
    test('put', () => request(server).put('/').expect(200, 'put'))
    test('patch', () => request(server).patch('/').expect(200, 'patch'))
    test('delete', () => request(server).delete('/').expect(200, 'delete'))
    test('options', () => request(server).options('/').expect(200, 'options'))
  })

  test.skip('middleware', () => {
    
  })
})
