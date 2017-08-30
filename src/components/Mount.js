import compose from 'koa-compose'
import mount from 'koa-mount'

import Component from './Component'

const debug = require('debug')('koach:mount')

export default class Mount extends Component {
  static of (path, ...components) {
    return new Mount({ path }).use(...components)
  }

  compose (middleware) {
    const { path = '/' } = this.config
    if (path === '/') {
      debug("Useless mount for path '/'")
    }
    return mount(path, compose(middleware()))
  }
}
