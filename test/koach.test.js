import Koa from 'koa'
import request from 'supertest'

import Koach from '../src/lib/Koach'
import Server, { NodeServer } from '../src/lib/Server'
import Component from '../src/components/Component'

describe('koach', () => {
  test('register component class', () => {
    const app = new Koach()
    app.registerComponent('Test', () => Component)
    const rootCmpnt = app.registry.get('root')
    expect(rootCmpnt.subcomponents).toHaveLength(1)
    expect(rootCmpnt.subcomponents[0].type).toBe(Component)
  })

  test('register multiple component class', () => {
    const app = new Koach()
    app.registerComponent('First', () => Component)
    app.registerComponent('Second', () => Component)
    const rootCmpnt = app.registry.get('root')
    expect(rootCmpnt.subcomponents).toHaveLength(2)
  })

  test('config()', () => {
    const app = new Koach()
    app.config({ test: true })
    const rootCmpnt = app.registry.get('root')
    expect(rootCmpnt.config).toEqual(expect.objectContaining({ test: true }))
  })

  test('immutable config', () => {
    const app = new Koach()
    const config = { test: true }
    app.config(config)
    const rootCmpnt = app.registry.get('root')
    expect(() => {
      rootCmpnt.config.test = false
    }).toThrow(TypeError)
    expect(() => config.test = false).not.toThrow()
  })

  test('server(Function)', () => {
    const app = new Koach()
    const server = new Server()
    app.server(() => server)
    expect(app.createServer()).toBe(server)
  })

  test('server(Server)', () => {
    const app = new Koach()
    const server = new Server()
    app.server(server)
    expect(app.createServer()).toBe(server)
  })

  test('createHandler()', () => {
    const app = new Koach()
    class Test extends Component {
      compose () { return ctx => ctx.body = 'ok' }
    }
    app.registerComponent('Test', () => Test)
    const handler = app.createHandler()
    const http = new Koa().use(handler).listen()
    return request(http)
      .get('/')
      .expect(200, 'ok')
      .then(() => http.close())
  })

  test('listen()', () => {
    const app = new Koach()
    const server = new NodeServer()
    app.server(server)
    app.listen(() =>
      expect(server.listening).toBe(true))
    server.disconnect()
  })
})
