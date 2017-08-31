import Bottle from 'bottlejs'

class Registry {
  constructor (name) {
    this.bottle = new Bottle(name)
  }

  get (name) {
    return this.bottle.container[name]
  }
}

[
  'service',
  'factory',
  'provider',
  'constant',
  'value',
  'decorator',
  'middleware'
].forEach((method) => {
  Registry.prototype[method] = function (...args) {
    this.bottle[method](...args)
  }
})

// expose global config
Registry.config = Bottle.config

module.exports = Registry
