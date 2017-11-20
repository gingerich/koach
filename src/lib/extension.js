function Extension (...args) {
  if (!(this instanceof Extension)) {
    return new Extension(...args)
  }
  this.plugins = {}
  if (args) {
    this.plugin(...args)
  }
}

Extension.prototype.plugin = function (name, plug) {
  if (name instanceof Extension) {
    name.extend(this.plugins)
    return this
  }
  if (typeof name === 'function') {
    return name.call(this, this.plugins) || this
  }

  let ext
  if (typeof name !== 'string') {
    ext = name
  } else {
    ext = {
      [name] () {
        if (typeof plug === 'string') {
          return this[plug].apply(this, arguments)
        }
        return plug.apply(this, arguments) || this
      }
    }
  }
  Object.assign(this.plugins, ext)
  return this
}

Extension.prototype.extend = function (target) {
  const extension = new Extension()
  // if (typeof target === 'function' && target.prototype) {
  //   Object.assign(target.prototype, this.plugins)
  // } else {
  //   Object.assign(target, this.plugins)
  // }
  if (typeof target === 'function' && target.prototype) {
    extension.plugins = target.prototype
  } else {
    extension.plugins = target
  }
  extension.plugin(this.plugins)
  return target
}

// Alias use === plugin                                                          
Extension.prototype.use = Extension.prototype.plugin

module.exports = Extension

// Can be used as a singleton
const extension = new Extension()
module.exports.plugin = extension.plugin.bind(extension)
module.exports.extend = extension.extend.bind(extension)
