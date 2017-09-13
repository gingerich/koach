import Component from './Component'
import Stack from './Stack'
import Registry from '../lib/Registry'

module.exports = class ApplicationContext extends Component {
  constructor (config, context) {
    super(config, context)
    this.registry = new Registry()
  }

  get server () {
    return this.config.server
  }

  set server (server) {
    this.config.server = server
  }

  getChildContext () {
    return this
  }

  attach (name, factory, ...deps) {
    this.registry.factory(name, factory, ...deps)
    Object.defineProperty(this, name, {
      get () {
        return this.registry.get(name)
      }
    })
  }

  compose (middleware) {
    // middleware() could modify this.subcomponents and must be called first
    const middlewares = middleware()
    return Stack.spec()
      .use(this.subcomponents)
      .use(middlewares)
  }
}
