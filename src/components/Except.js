import compose from 'koa-compose'
import except from 'koa-except'
import Component from './Component'

module.exports = class Except extends Component {
  compose (middleware) {
    const fn = compose(middleware())
    return except.call(fn, { ...this.config })
  }
}
