import { EventEmitter } from 'events'
import http from 'http'

const debug = require('debug')('koach:server')

const serverEvents = [
  'checkContinue', 'checkExpectation', 'clientError',
  'close', 'connect', 'connection', 'request', 'upgrade'
]

export default class Server extends EventEmitter {
  static listener (fn) {
    const server = new this()
    server.on('request', fn)
    return server
  }

  constructor (config = {}) {
    super()
    this.config = config
    this.middleware = []
    this.http = http.createServer((req, res) => {
      // If this 'request' listener is called, then the request was not intercepted
      // Use value of res.headersSent for additional certainty
      req.unhandled = !res.headersSent
    })
    serverEvents.forEach((eventName) => {
      this.http.on(eventName, (...args) => this.emit(eventName, ...args))
    })
  }

  use (...middleware) {
    this.middleware.push(...middleware)
    return this
  }

  listen (...args) {
    throw new Error(`${this.constructor.name} must implement listen()`)
  }

  disconnect () {
    if (!this.http) {
      debug('Cannot disconnect. The server has not been started.')
      return
    }
    if (!(this.http instanceof http.Server)) {
      debug('Cannot call close() on unrecognized http server instance.')
      return
    }
    return this.http.close((err) => {
      if (!err) return
      debug('Failed to shutdown gracefully', err)
      throw err
    })
  }

  get listening () {
    return this.http.listening
  }
}

export class NodeServer extends Server {
  listen (...args) {
    return this.http.listen(...args)
  }
}

export function listener (fn) {
  return NodeServer.listener(fn)
  // const server = new NodeServer()
  // server.on('request', fn)
  // return server
}
