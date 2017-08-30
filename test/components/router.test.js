import request from 'supertest'

import Spec from '../../src/lib/Spec'
import { Provider, Router, Component, Module } from '../../src'

describe('Router component', () => {
  let Koach

  beforeEach(() => {
    Koach = new Provider()
  })

  test('empty router', () => {
    Koach.registerComponent('Test', () => Router)
    const server = Koach.listen()
    request(server)
      .get('/')
      .expect(404)
      .end(() => server.close())
  })

  describe('http methods', () => {
    Koach = new Provider()

    const middleware = jest.fn()
    const router = Router.spec()
      .use((ctx, next) => { middleware(); next() })
      .get('/', ctx => ctx.body = 'get')
      .post('/', ctx => ctx.body = 'post')
      .put('/', ctx => ctx.body = 'put')
      .patch('/', ctx => ctx.body = 'patch')
      .del('/', ctx => ctx.body = 'delete')
      .options('/', ctx => ctx.body = 'options')

    const server = Koach.createServer()
    server.use(Spec.compose(router))
    const http = server.listen()

    afterAll(() => {
      http.close()
    })

    test('get', () => request(http).get('/').expect(200, 'get'))
    test('post', () => request(http).post('/').expect(200, 'post'))
    test('put', () => request(http).put('/').expect(200, 'put'))
    test('patch', () => request(http).patch('/').expect(200, 'patch'))
    test('delete', () => request(http).delete('/').expect(200, 'delete'))
    test('options', () => request(http).options('/').expect(200, 'options'))
    test('middleware', () => expect(middleware).toHaveBeenCalledTimes(6))
  })

  describe('param(name, fn)', () => {
    const spec = Router.spec()
    class MyComponent extends Component {
      compose () {
        return spec
      }
    }

    let server
    afterEach(() => {
      server.close()
    })

    test('without params', () => {
      spec.get('/', ctx => ctx.body = 'home')
      Koach.registerComponent('App', () => MyComponent)
      server = Koach.listen()
      return request(server)
        .get('/')
        .expect(200, 'home')
    })

    test('without param handlers', () => {
      spec.get('/:user', (ctx) => {
        ctx.body = ctx.params.user
      })
      Koach.registerComponent('App', () => MyComponent)
      server = Koach.listen()
      return request(server)
        .get('/foo')
        .expect(200, 'foo')
    })

    test('with param handlers', () => {
      spec.param('user', (ctx, id) => {
        ctx.user = id
      })
      spec.get('/:user/get', ctx => ctx.body = ctx.user)
      Koach.registerComponent('App', () => MyComponent)
      server = Koach.listen()
      return request(server)
        .get('/foo/get')
        .expect('foo')
    })

    test('with multiple params', () => {
      spec.param('repo', (ctx, userId, repoId) => {
        ctx.repo = repoId
      })
      spec.get('/:user/:repo', ctx => ctx.body = ctx.user + ':' + ctx.repo)
      Koach.registerComponent('App', () => MyComponent)
      server = Koach.listen()
      return request(server)
        .get('/foo/bar')
        .expect(200, 'foo:bar')
    })

    test('with multiple param handlers', () => {
      spec.param('user', (ctx, id) => {
        ctx.user = ctx.user.toUpperCase()
      })
      Koach.registerComponent('App', () => MyComponent)
      server = Koach.listen()
      return request(server)
        .get('/foo/get')
        .expect(200, 'FOO')
    })
  })

  describe('asyncronous stack', () => {
    let server

    afterEach(() => {
      server.close()
    })

    test('wait for downstream middleware', () => {
      class MyComponent extends Component {
        compose () {
          return Module.spec()
            .use(async (ctx, next) => {
              await next()
              ctx.body = 'done'
            })
            .use(Router.spec()
              .get('/', (ctx) => {
                ctx.body = 'test'
              }))
        }
      }

      Koach.registerComponent('App', () => MyComponent)
      server = Koach.listen()

      return request(server)
        .get('/')
        .expect(200, 'done')
    })

    test('catch downstream errors', () => {
      class MyComponent extends Component {
        compose () {
          return Module.spec()
            .use(async (ctx, next) => {
              try { return await next() }
              catch (e) { ctx.body = 'error' }
            })
            .use(Router.spec()
              .get('/', ctx => ctx.throw(500, 'bad')))
        }
      }

      Koach.registerComponent('App', () => MyComponent)
      server = Koach.listen()

      return request(server)
        .get('/')
        .expect(200, 'error')
    })
  })

  describe('mount nested', () => {
    class MyComponent extends Component {
      compose () {
        return Router.spec()
          .get('/', ctx => ctx.body = '/')
          .use(
            '/foo',
            Router.spec()
              .get('/bar', ctx => ctx.body = '/foo/bar')
              .param('id', (ctx, id) => ctx.id = parseInt(id, 10))
              .get('/:id', ctx => ctx.body = { id: ctx.id })
          )
      }
    }

    let server

    beforeEach(() => {
      const koach = new Provider()
      koach.registerComponent('App', () => MyComponent)
      server = koach.listen()
    })

    afterEach(() => {
      server.close()
    })

    test('top-level route', () =>
      request(server)
        .get('/')
        .expect(200, '/'))

    test('nested path handler', () =>
      request(server)
        .get('/foo/bar')
        .expect(200, '/foo/bar'))

    test('nested path params', () => {
      return request(server)
        .get('/foo/123')
        .expect(200, { id: 123 })
    })
  })
})
