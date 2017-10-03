import compose from 'koa-compose'
import methods from 'methods'
import pathToRegexp from 'path-to-regexp'

import Component from './Component'
import Mount from './Mount'
import Spec from '../lib/Spec'

class Router extends Component {
  static specType () {
    return RouterSpec
  }

  compose (middleware) {
    return Mount.spec({ path: this.config.path })
      .use(this.config.subcomponents)
  }
}

Router.prototype.del = Router.prototype.delete

Router.methods = methods

class Layer extends Component {
  get path () {
    return this.config.path
  }

  compose (middleware) {
    return Path.spec({ ...this.config })
      .use(Params.spec({ ...this.config }))
      .use(this.config.subcomponents)
  }
}

class Route extends Component {
  compose (middleware) {
    const { method } = this.config
    return Method.spec({ method })
      .use(Layer.spec({ ...this.config })
        .use(this.config.subcomponents))
  }
}

class Path extends Component {
  compose (middleware) {
    const handler = compose(middleware())
    const params = []
    const { path, options = {} } = this.config
    const re = pathToRegexp(path, params, options)
    return function pathHandler (ctx, next) {
      const match = re.exec(ctx.path)
      if (match) {
        // Consume matched path. Downstream components need not know path hierarchy
        ctx.path = ctx.path.replace(match[0], '') || '/'
        const args = match.slice(1).map(decode)
        ctx.params = {}
        args.forEach((arg, i) => {
          ctx.params[i] = arg
        })
        // This is probably incorrect: test with "zero-or-more" feature
        params.forEach((param, i) => {
          ctx.params[param.name] = args[i]
        })
        ctx.parsedPath = { match, params, args }
        return handler(ctx, next)
      }
      return next()
    }
  }
}

class Method extends Component {
  compose (middleware) {
    const handler = compose(middleware())
    let { method } = this.config
    if (method) method = method.toUpperCase()
    return function methodHandler (ctx, next) {
      if (!Method.matches(ctx.method, method)) return next()
      return handler(ctx, next)
    }
  }

  static matches (method, matchMethod) {
    if (!matchMethod) return true
    if (method === matchMethod) return true
    if (matchMethod === 'GET' && method === 'HEAD') return true
    return false
  }
}

class Params extends Component {
  paramHandlers (params) {
    const handlers = params.filter(param => !!this.config.params[param.name])
      .map(param => this.config.params[param.name])
    return Array.prototype.concat.apply([], handlers)
  }

  compose () {
    return async function paramsHandler (ctx, next) {
      if (!ctx.parsedPath) {
        throw new Error('Missing ctx.parsedPath. You probably meant to use the Path component preceeding Params')
      }
      const { params, args } = ctx.parsedPath
      const handlers = this.paramHandlers(params)
      if (handlers.length) {
        await Promise.all(handlers.map(fn => fn(ctx, ...args)))
      }
      return next()
    }.bind(this)
  }
}

class RouterSpec extends Spec {
  constructor (type, config, subcomponents) {
    super(type, { params: {}, ...config }, subcomponents)
    this.routes = {}
  }

  use (...components) {
    if (typeof components[0] === 'string') {
      const path = components.shift()
      const config = {
        ...this.config,
        path,
        options: { end: false }
      }
      const layer = Layer.spec(config).use(components)
      return this.use(layer)
    }
    return super.use(...components)
  }

  all (path, ...middleware) {
    this.use(Route.spec({ ...this.config, path })).use(middleware)
    return this
  }

  route (path, controller) {
    const layer = Layer.spec({ ...this.config, path }).use(controller)//.path(path))
    return this.use(layer)
  }

  param (name, fn) {
    (this.config.params[name] = this.config.params[name] || []).push(fn)
    return this
  }
}

Router.methods.forEach((method) => {
  RouterSpec.prototype[method] = function (path, ...middleware) {
    const route = Route.spec({ ...this.config, path, method }).use(middleware)
    this.use(route)
    return this
  }
})

RouterSpec.prototype.del = RouterSpec.prototype.delete
RouterSpec.prototype.controller = RouterSpec.prototype.route

function decode (val) {
  return val ? decodeURIComponent(val) : null
}

module.exports = Router
module.exports.Layer = Layer
module.exports.Route = Route
module.exports.Path = Path
module.exports.Method = Method
module.exports.Params = Params
module.exports.Spec = RouterSpec
