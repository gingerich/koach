import methods from 'methods'

import Component from './Component'

const debug = require('debug')('koach:controller')
const route = require('koa-path-match')()

// @path('/:id')
module.exports = class Controller extends Component {
  compose () {
    const controller = this.config.controller || this
    const path = this.constructor.PATH || this.config.path || '/'
    const router = route(path)
    const handledMethods = []
    methods.forEach((method) => {
      const handler = controller[method]
      if (handler) {
        if (typeof (handler) !== 'function') {
          throw new Error(`Expected controller.${method} to be a function`)
        }
        handledMethods.push(method)
        router[method](ctx => handler.call(controller, ctx))
      }
    })
    debug(`[${handledMethods}] ${path}`)
    return router
  }
}
