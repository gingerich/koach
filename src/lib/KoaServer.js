import Koa from 'koa'
import Server from './Server'

const debug = require('debug')('koach:koaserver')

export default class KoaServer extends Server {
  constructor (config) {
    let koa
    if (config instanceof Koa) {
      koa = config
      config = {}
    } else {
      koa = new Koa(config)
    }
    super(config)
    this.engine = koa
  }

  listen (port, host, ...args) {
    debug('listening')

    // this.engine = new Koa(this.config)
    this.middleware.forEach(m => this.engine.use(m))
    const handler = this.engine.callback()

    this.http.on('request', (req, res) => {
      if (!req.unhandled) {
        return
      }
      handler.call(this.http, req, res)
    })

    this.http.listen(port, host, ...args)
    return this.http
  }
}
