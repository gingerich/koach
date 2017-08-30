import methods from 'methods'

import Component from './Component'

const debug = require('debug')('koach')
const route = require('koa-path-match')()

// @path('/:id')
export default class Controller extends Component {
  compose () {
    const controller = this.config.controller || this
    const path = this.constructor.PATH || this.config.path || '/'
    const router = route(path)
    methods.forEach((method) => {
      const handler = controller[method]
      if (handler) {
        if (typeof (handler) !== 'function') {
          throw new Error(`Expected controller.${method} to be a function`)
        }
        router[method](ctx => handler.call(controller, ctx))
      }
    })
    return router
  }
}
