import invariant from 'invariant'
import get from 'lodash.get'
// import Spec from '../lib/Spec'

const debug = require('debug')('koach:component')

module.exports = class Component {
  static specType (Spec) {
    return Spec
  }

  static spec (config, factory = this) {
    const Spec = require('../lib/Spec')
    const Type = this.specType(Spec)
    return new Type(factory, config)
  }

  static compose (config) {
    return new this(config).compose()
  }

  static of (fn) {
    if (typeof (fn) !== 'function') {
      throw new Error('Must supply a function')
    }

    return new (class extends Component {
      compose () {
        return fn// .bind(this)
      }
    })()
  }

  static functional (fn) {
    return class extends Component {
      compose () {
        return fn(this.config)
      }
    }
  }

  constructor (config, context) {
    this.config = Object.assign(get.bind(null, config), config)
    this.context = context
    this.subcomponents = []
  }

  use (...components) {
    // components.forEach(this.useComponent.bind(this))
    components.forEach((component) => {
      // if (!(component instanceof Component)) {
      //   component = Component.of(component)
      // }
      invariant(typeof component === 'function', 'Middleware must be a function')
      this.subcomponents.push(component)
    })
    return this
  }

  // useComponent (component) {
  //   if (!(component instanceof Component)) {
  //     component = Component.of(component)
  //   }
  //   this.subcomponents.push(component)
  // }

  componentWillMount (defer) {
    // Component lifecycle method
  }

  componentDidMount () {
    // Component lifecycle method
  }

  /*
   * Return middleware function (See http://koajs.com)
   */
  compose () {
    throw new Error(`${this.constructor.name} must implement compose() or extend a class that does.`)
  }

  toJSON () {
    return JSON.stringify(this.constructor.name)
  }
}
