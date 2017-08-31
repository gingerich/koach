import compose from 'koa-compose'
import Component from './Component'

module.exports = class Stack extends Component {
  compose (middleware) {
    return compose(middleware())
  }
}
