import Component from './Component'
import Mount from './Mount'

// @path('/foo')
module.exports = class Module extends Component {
  constructor (config) {
    super(config)
    this.path = this.config.path || this.constructor.PATH
  }

  compose () {
    return Mount.spec({ path: this.path, ...this.config })
      .use(this.config.subcomponents)
  }
}
