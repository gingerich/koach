function Extension (...args) {
  if (!(this instanceof Extension)) {
    return new Extension(...args)
  }
  this.proto = {}
  if (args) {
    this.plugin(...args)
  }
}

Extension.prototype.plugin = function (name, plug) {
  if (name instanceof Extension) {
    name.extend(this.proto)
    return this
  }
  if (typeof name === 'function') {
    return name.call(this, this) || this
  }

  let ext = {}
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
  Object.assign(this.proto, ext)
  return this
}

Extension.prototype.extend = function (target) {
  if (typeof target === 'function' && target.prototype) {
    Object.assign(target.prototype, this.proto)
  } else {
    Object.assign(target, this.proto)
  }
  return target
}

module.exports = Extension

const extension = new Extension()
module.exports.plugin = extension.plugin.bind(extension)
module.exports.extend = extension.extend.bind(extension)
