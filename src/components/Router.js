import compose from 'koa-compose'
import methods from 'methods'
import pathToRegexp from 'path-to-regexp'

import Component from './Component'
import Mount from './Mount'
import Spec from '../lib/Spec'
import extension from '../lib/extension'

const debug = require('debug')('koach:router')

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
      .use(
        Layer.spec({ ...this.config })
          .use(this.config.subcomponents)
      )
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
        const newPath = ctx.path.replace(match[0], '') || '/'
        debug(`match path ${match[0]} -> ${newPath}`)
        ctx.path = newPath

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
  static matches (method, matchMethod) {
    if (!matchMethod) return true
    matchMethod = matchMethod.toUpperCase()
    if (method === matchMethod) return true
    if (matchMethod === 'GET' && method === 'HEAD') return true
    return false
  }

  compose (middleware) {
    const handler = compose(middleware())
    const { method } = this.config
    return function methodHandler (ctx, next) {
      if (!Method.matches(ctx.method, method)) return next()
      return handler(ctx, next)
    }
  }
}

class Params extends Component {
  constructor (config) {
    super(config)
    this.params = config.params || {}
  }

  paramHandlers (params) {
    const handlers = params.filter(param => !!this.params[param.name])
      .map(param => this.params[param.name])
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

class Router extends Component {
  compose (middleware) {
    return Mount.spec({ path: this.config.path })
      .use(this.config.subcomponents)
  }
}

Router.methods = methods

Router.plugins = extension()
  .plugin('all', function (path, ...middleware) {
    this.use(Route.spec({ ...this.config, path })).use(middleware)
    return this
  })
  .plugin('route', function (path, controller) {
    const layer = Layer.spec({ ...this.config, path }).use(controller.path(path))
    return this.use(layer)
  })
  .plugin('param', function (name, fn) {
    (this.config.params[name] = this.config.params[name] || []).push(fn)
    return this
  })
  .plugin(Router.methods.reduce((plugins, method) => {
    plugins[method] = function (path, ...middleware) {
      const route = Route.spec({ ...this.config, path, method }).use(middleware)
      this.use(route)
      return this
    }
    return plugins
  }, {}))
  .plugin('del', 'delete') // delete() aliased to del()
  .plugin('controller', 'route') // route() aliased to controller()

Router.Spec = class RouterSpec extends Spec {
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
}

function decode (val) {
  return val ? decodeURIComponent(val) : null
}

module.exports = Router
module.exports.Layer = Layer
module.exports.Route = Route
module.exports.Path = Path
module.exports.Method = Method
module.exports.Params = Params
