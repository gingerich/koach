import Component from '../components/Component'
import Except from '../components/Except'
import Mount from '../components/Mount'
import Registry from './Registry'

const debug = require('debug')('koach:spec')

class Spec {
  static of (type, config, ...subcomponents) {
    return new this(type, config, subcomponents)
  }

  static factory (fn, ...deps) {
    return Object.assign(fn, { $deps: deps })
  }

  static compose (spec, context, parent) {
    if (typeof spec === 'function') {
      return spec
    }

    const component = spec.make(context)

    if (!(component instanceof Component)) {
      throw new TypeError('Expected spec to generate Component type')
    }

    // context = component.getChildContext()

    const middleware = (function middleware () {
      return this.config.subcomponents.map(s => Spec.compose(s, this.getChildContext(), this))
    }.bind(component))

    component.componentWillMount()

    const fn = Spec.compose(component.compose(middleware), context, component)

    component.componentDidMount(parent)

    return Object.assign(fn, spec)
  }

  constructor (type, config = {}, subcomponents = []) {
    this.type = type
    this.config = config
    this.subcomponents = subcomponents.slice(0)
    this.registry = new Registry()

    function componentFactory ({ context }) {
      const { Type, config, subcomponents } = this
      return new Type({ ...config, subcomponents }, context)//, ...deps)
    }
    this.registry.factory('component', componentFactory.bind(this), 'context')
  }

  get Type () {
    const { type } = this
    return Object.prototype.hasOwnProperty.call(type, 'prototype')
      ? type : function factory (...args) { return type(...args) }
  }

  use (...components) {
    if (typeof components[0] === 'string') {
      const path = components.shift()
      return this.use(Mount.spec({ path }).use(...components))
    }
    if (Array.isArray(components[0])) {
      components = components[0]
    }
    this.useComponents(components)
    return this
  }

  useComponents (components) {
    this.subcomponents.push(...components)
  }

  ref (fn) {
    function refDecorator (instance) {
      fn(instance)
      return instance
    }
    this.registry.decorator('component', refDecorator)
    return this
  }

  except (opts) {
    return Except.spec(opts).use(this)
  }

  make (context) {
    this.registry.value('context', context)
    return this.registry.get('component')
  }

  compose () {
    return Spec.compose(this)
  }
}

// Add setters for promoted config properties
;['path'].forEach((prop) => {
  Spec.prototype[prop] = function (value) {
    this.config[prop] = value
    return this
  }
})

module.exports = Spec
