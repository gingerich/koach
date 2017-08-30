import { Server as HttpServer } from 'http'
import Koa from 'koa'
import request from 'supertest'

import Server, { NodeServer, listener } from '../../src/lib/Server'
import KoaServer from '../../src/lib/KoaServer'

describe('Server', () => {
  test('has http server instance', () => {
    const server = new Server()
    expect(server.http).toBeInstanceOf(HttpServer)
  })

  test('server.disconnect()', async () => {
    const server = new KoaServer()
    const http = server.listen()
    server.disconnect()
    expect(http.listening).toBe(false)
  })

  test('construct Server from listener', () => {
    const server = listener((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end('ok')
    })

    request(server.listen())
      .get('/')
      .expect(200, 'ok')
      .end(() => server.disconnect())
  })

  describe('event emission', () => {
    let server

    beforeEach(() => {
      server = new NodeServer()
      server.on('request', (req, res) => {
        res.writeHead(200)
        res.end()
      })
    })

    afterEach(() => {
      server.disconnect()
    })

    test('request', () => {
      server.listen(() =>
        request(this)
          .get('/')
          .expect(200))
    })

    test('close', async () => {
      const fn = jest.fn()
      server.on('close', fn)
      server.listen(() => server.close(() => expect(fn).toHaveBeenCalledTimes(1)))
    })

    test('connection', async () => {
      const fn = jest.fn()
      server.on('connection', fn)
      await request(server.listen()).get('/')
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})

describe('KoaServer', () => {
  test('construct from koa instance', () => {
    const koa = new Koa().use(ctx => ctx.body = 'test')
    const server = new KoaServer(koa)

    request(server.listen())
      .get('/')
      .expect(200, 'test')
      .end(() => server.disconnect())
  })

  test('empty constructor', () => {
    const server = new KoaServer()
    request(server.listen())
      .get('/')
      .expect(404)
      .end(() => server.disconnect())
  })

  test('server.http is hijack-able', async () => {
    const server = new KoaServer()
    server.http.on('request', (req, res) => {
      if (req.url !== '/test') {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('okay')
      }
    })
    server.use(ctx => ctx.body = 'test')

    const http = server.listen()
    await request(http)
      .get('/')
      .expect(200, 'okay')

    await request(http)
      .get('/test')
      .expect(200, 'test')

    server.disconnect()
  })

  test('server.listening', () => {
    const server = new NodeServer()
    expect(server.listening).toBe(false)
    server.listen(() =>
      expect(server.listening).toBe(true))
    server.disconnect()
  })
})
