import ApplicationContext from '../components/ApplicationContext'
import Registry from './Registry'
import KoaServer from './KoaServer'
import Spec from './Spec'

const debug = require('debug')('koach')

export default class Koach {
  constructor () {
    this.registry = new Registry()
    this.registry.service('root', rootFactory, 'config')
    this.registry.factory('server', serverFactory)
    this.registry.factory('app', appFactory, 'server', 'root')
  }

  registerComponent (name, component) {
    function decorator (rootSpec) {
      const spec = Spec.of(component(), rootSpec.config)
      rootSpec.use(spec)
      debug(`using ${name}`)
      return rootSpec
    }
    this.registry.decorator('root', decorator)
  }

  config (config) {
    this.registry.constant('config', { ...config })
  }

  server (factory) {
    function safeFactory (server) {
      if (typeof factory !== 'function') {
        // Assume factory is Server instance
        return factory
      }
      return factory(server)
    }
    this.registry.decorator('server', safeFactory)
  }

  compose (spec) {
    return Spec.compose(spec)
  }

  createHandler () {
    return Spec.compose(this.registry.get('root'))
  }

  createServer () {
    return this.registry.get('app')
  }

  listen (...args) {
    const server = this.createServer()
    return server.listen(...args)
  }
}

function rootFactory (config) {
  return ApplicationContext.spec(config)
}

function serverFactory () {
  return new KoaServer()
}

function appFactory ({ server, root: rootSpec }) {
  rootSpec.set('server', server)
  server.use(rootSpec.compose())
  return server
}
