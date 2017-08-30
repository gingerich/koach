import compose from 'koa-compose'
import Component from './Component'

export default class Stack extends Component {
  compose (middleware) {
    return compose(middleware())
  }
}
